"""
Add page images to the existing JSON extraction
Uses PyMuPDF (fitz) which doesn't require poppler
"""
import json
import base64
import os
from pathlib import Path
from io import BytesIO

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False
    print("PyMuPDF not available, trying pdf2image...")
    try:
        from pdf2image import convert_from_path
        HAS_PDF2IMAGE = True
    except ImportError:
        HAS_PDF2IMAGE = False
        print("Neither PyMuPDF nor pdf2image available. Installing PyMuPDF...")

def merge_overlapping_regions(regions, overlap_threshold=0.2, proximity_threshold=100):
    """
    Merge regions that overlap significantly or are nearby (within proximity_threshold pixels).
    Enhanced to combine nearby diagram fragments into complete diagrams.
    """
    if not regions:
        return []
    
    merged = []
    used = set()
    
    for i, region1 in enumerate(regions):
        if i in used:
            continue
        
        x1, y1, w1, h1 = region1['x'], region1['y'], region1['width'], region1['height']
        merged_region = region1.copy()
        
        for j, region2 in enumerate(regions[i+1:], start=i+1):
            if j in used:
                continue
            
            x2, y2, w2, h2 = region2['x'], region2['y'], region2['width'], region2['height']
            
            # Calculate overlap
            overlap_x = max(0, min(x1 + w1, x2 + w2) - max(x1, x2))
            overlap_y = max(0, min(y1 + h1, y2 + h2) - max(y1, y2))
            overlap_area = overlap_x * overlap_y
            
            area1 = w1 * h1
            area2 = w2 * h2
            min_area = min(area1, area2)
            
            should_merge = False
            
            # Check for overlap
            if min_area > 0 and overlap_area / min_area > overlap_threshold:
                should_merge = True
            else:
                # Check for proximity (nearby regions that might be part of same diagram)
                center1_x = x1 + w1 / 2
                center1_y = y1 + h1 / 2
                center2_x = x2 + w2 / 2
                center2_y = y2 + h2 / 2
                
                distance = ((center1_x - center2_x)**2 + (center1_y - center2_y)**2)**0.5
                
                # If regions are close and have similar sizes, they might be part of same diagram
                if distance < proximity_threshold:
                    size_ratio = min(area1, area2) / max(area1, area2) if max(area1, area2) > 0 else 0
                    if size_ratio > 0.3:  # Similar sizes
                        should_merge = True
            
            if should_merge:
                # Merge regions
                new_x = min(x1, x2)
                new_y = min(y1, y2)
                new_w = max(x1 + w1, x2 + w2) - new_x
                new_h = max(y1 + h1, y2 + h2) - new_y
                
                merged_region['x'] = new_x
                merged_region['y'] = new_y
                merged_region['width'] = new_w
                merged_region['height'] = new_h
                merged_region['extraction_method'] = 'merged_region'
                
                x1, y1, w1, h1 = new_x, new_y, new_w, new_h
                used.add(j)
        
        merged.append(merged_region)
    
    return merged

def get_text_blocks_map(page, scale_x, scale_y):
    """
    Extract text blocks from PDF page and return their bounding boxes in image coordinates.
    Returns a list of (x, y, w, h) tuples representing text block rectangles.
    """
    text_blocks = []
    try:
        # Get text as dictionary with block information
        text_dict = page.get_text("dict")
        page_rect = page.rect
        
        for block in text_dict.get("blocks", []):
            if "lines" not in block:  # Skip non-text blocks
                continue
            
            # Get bounding box for this text block
            bbox = block.get("bbox", [])
            if len(bbox) == 4:
                # Convert from PDF coordinates to image coordinates
                x0, y0, x1, y1 = bbox
                x = int(x0 * scale_x)
                y = int(y0 * scale_y)
                w = int((x1 - x0) * scale_x)
                h = int((y1 - y0) * scale_y)
                
                # Only include blocks with reasonable size (filter out tiny text artifacts)
                if w > 10 and h > 10:
                    text_blocks.append((x, y, w, h))
    except Exception as e:
        print(f"Warning: Could not extract text blocks: {e}")
    
    return text_blocks

def is_text_heavy_region(region_bbox, text_blocks, threshold=0.3):
    """
    Check if a region overlaps significantly with text blocks.
    Returns True if more than threshold% of the region is covered by text blocks.
    """
    x, y, w, h = region_bbox
    region_area = w * h
    
    if region_area == 0:
        return False
    
    # Calculate total text coverage in this region
    text_coverage = 0
    
    for tx, ty, tw, th in text_blocks:
        # Calculate overlap between region and text block
        overlap_x = max(0, min(x + w, tx + tw) - max(x, tx))
        overlap_y = max(0, min(y + h, ty + th) - max(y, ty))
        overlap_area = overlap_x * overlap_y
        
        text_coverage += overlap_area
    
    # Return True if text coverage exceeds threshold
    return (text_coverage / region_area) > threshold

def extract_complete_diagram_region(page, anchor_rect, text_blocks, img_array, scale_x, scale_y, img_width, img_height):
    """
    Start from an embedded image anchor point and expand region outward,
    stopping at text blocks or page boundaries. Include nearby visual elements.
    Returns complete bounding box (x, y, w, h) or None if expansion fails.
    """
    # Convert anchor rect from PDF coordinates to image coordinates
    x = int(anchor_rect.x0 * scale_x)
    y = int(anchor_rect.y0 * scale_y)
    w = int((anchor_rect.x1 - anchor_rect.x0) * scale_x)
    h = int((anchor_rect.y1 - anchor_rect.y0) * scale_y)
    
    # Start with the embedded image as base region
    base_x, base_y, base_w, base_h = x, y, w, h
    
    # Expand outward in steps, checking for text blocks
    max_expansion = min(img_width, img_height) * 0.4  # Max 40% of page dimension
    expansion_step = 20  # Expand 20 pixels at a time
    
    # Try expanding in all directions
    for expansion in range(0, int(max_expansion), expansion_step):
        # Calculate expanded region
        exp_x = max(0, base_x - expansion)
        exp_y = max(0, base_y - expansion)
        exp_w = min(img_width - exp_x, base_w + 2 * expansion)
        exp_h = min(img_height - exp_y, base_h + 2 * expansion)
        
        # Check if this expansion would hit too many text blocks
        expanded_bbox = (exp_x, exp_y, exp_w, exp_h)
        
        # Allow some text overlap (diagrams can have labels), but not too much
        if is_text_heavy_region(expanded_bbox, text_blocks, threshold=0.4):
            # Too much text, stop expanding
            break
        
        # Update current region
        x, y, w, h = exp_x, exp_y, exp_w, exp_h
    
    # Ensure minimum size
    if w < 100 or h < 100:
        return None
    
    return (x, y, w, h)

def detect_diagram_regions_visual(img_array, text_blocks, img_width, img_height):
    """
    Use OpenCV to find regions with high edge density and low text overlap.
    Returns list of candidate diagram regions as (x, y, w, h) tuples.
    """
    import cv2
    import numpy as np
    
    diagram_candidates = []
    
    # Convert to grayscale
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    
    # Detect edges (diagrams have many lines/shapes)
    edges = cv2.Canny(gray, 50, 150)
    
    # Dilate edges to connect nearby diagram elements
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
    dilated = cv2.dilate(edges, kernel, iterations=2)
    
    # Find contours
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    min_area = 15000  # Higher threshold to filter out small text regions
    
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < min_area:
            continue
        
        x, y, w, h = cv2.boundingRect(contour)
        
        # Add padding
        padding = 30
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(img_width - x, w + 2 * padding)
        h = min(img_height - y, h + 2 * padding)
        
        # Skip if too small
        if w < 150 or h < 150:
            continue
        
        # Check if this region is text-heavy (exclude text paragraphs)
        region_bbox = (x, y, w, h)
        if is_text_heavy_region(region_bbox, text_blocks, threshold=0.3):
            # This is likely a text region, skip it
            continue
        
        diagram_candidates.append(region_bbox)
    
    return diagram_candidates

def validate_diagram_region(region_img_array):
    """
    Validate that a region contains actual diagram content (not just text or white space).
    Returns True if region appears to be a valid diagram.
    """
    import cv2
    import numpy as np
    
    if region_img_array.size == 0:
        return False
    
    # Convert to grayscale if needed
    if len(region_img_array.shape) == 3:
        gray = cv2.cvtColor(region_img_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = region_img_array
    
    # Check for sufficient visual content (edges)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / edges.size
    
    # Diagrams should have reasonable edge density (not too low, not too high)
    if edge_density < 0.01:  # Too uniform (likely white space)
        return False
    if edge_density > 0.5:  # Too dense (likely text)
        return False
    
    # Check aspect ratio (diagrams are usually wider than tall or roughly square)
    h, w = gray.shape[:2]
    aspect_ratio = w / h if h > 0 else 1
    
    # Reject extremely tall or extremely wide regions (likely text columns)
    if aspect_ratio < 0.3 or aspect_ratio > 5.0:
        return False
    
    # Check for color variance (diagrams have visual variety)
    variance = np.var(gray)
    if variance < 100:  # Too uniform
        return False
    
    return True

def extract_diagram_regions_from_page(page, page_num, embedded_image_rects=None, dpi=300):
    """
    Extract complete diagram regions from a rendered page using text-aware detection.
    Integrates all new methods: text block exclusion, smart expansion, visual detection, and validation.
    """
    from PIL import Image
    import numpy as np
    import cv2
    
    # Render page at high resolution to capture all content (vector + raster)
    zoom = dpi / 72.0  # Convert DPI to zoom factor
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    page_rect = page.rect
    
    # Convert to PIL Image
    img_data = pix.tobytes("png")
    page_img = Image.open(BytesIO(img_data))
    img_array = np.array(page_img.convert('RGB'))
    img_height, img_width = img_array.shape[:2]
    
    # Scale factor from PDF coordinates to image pixels
    scale_x = img_width / page_rect.width
    scale_y = img_height / page_rect.height
    
    # Get text blocks for exclusion
    text_blocks = get_text_blocks_map(page, scale_x, scale_y)
    
    diagram_regions = []
    
    # Method 1: Extract complete regions from embedded image anchors
    if embedded_image_rects:
        for img_rect in embedded_image_rects:
            # Use smart expansion that stops at text boundaries
            bbox = extract_complete_diagram_region(
                page, img_rect, text_blocks, img_array, 
                scale_x, scale_y, img_width, img_height
            )
            
            if bbox is None:
                continue
            
            x, y, w, h = bbox
            
            # Extract and validate the region
            region_img_array = img_array[y:y+h, x:x+w]
            if region_img_array.size == 0:
                continue
            
            # Validate it's actually a diagram
            if not validate_diagram_region(region_img_array):
                continue
            
            region_img = Image.fromarray(region_img_array)
            output_buffer = BytesIO()
            region_img.save(output_buffer, format='PNG')
            region_bytes = output_buffer.getvalue()
            region_base64 = base64.b64encode(region_bytes).decode('utf-8')
            
            diagram_regions.append({
                "page_number": page_num + 1,
                "region_index": len(diagram_regions) + 1,
                "image_data": f"data:image/png;base64,{region_base64}",
                "width": w,
                "height": h,
                "x": x,
                "y": y,
                "format": "png",
                "size_bytes": len(region_bytes),
                "extraction_method": "embedded_image_anchor",
                "validated": True
            })
    
    # Method 2: Visual content detection (text-excluded)
    # Only use if we found few regions from embedded images
    if len(diagram_regions) < 2:
        visual_candidates = detect_diagram_regions_visual(
            img_array, text_blocks, img_width, img_height
        )
        
        for x, y, w, h in visual_candidates:
            # Extract and validate the region
            region_img_array = img_array[y:y+h, x:x+w]
            if region_img_array.size == 0:
                continue
            
            # Validate it's actually a diagram
            if not validate_diagram_region(region_img_array):
                continue
            
            region_img = Image.fromarray(region_img_array)
            output_buffer = BytesIO()
            region_img.save(output_buffer, format='PNG')
            region_bytes = output_buffer.getvalue()
            region_base64 = base64.b64encode(region_bytes).decode('utf-8')
            
            diagram_regions.append({
                "page_number": page_num + 1,
                "region_index": len(diagram_regions) + 1,
                "image_data": f"data:image/png;base64,{region_base64}",
                "width": w,
                "height": h,
                "x": x,
                "y": y,
                "format": "png",
                "size_bytes": len(region_bytes),
                "extraction_method": "visual_content_detection",
                "validated": True
            })
    
    # Merge overlapping/nearby regions to combine split diagrams
    diagram_regions = merge_overlapping_regions(
        diagram_regions, 
        overlap_threshold=0.2, 
        proximity_threshold=100
    )
    
    # Re-extract merged regions and validate again
    final_regions = []
    for i, region in enumerate(diagram_regions):
        x, y, w, h = region['x'], region['y'], region['width'], region['height']
        region_img_array = img_array[y:y+h, x:x+w]
        
        if region_img_array.size == 0:
            continue
        
        # Final validation
        if not validate_diagram_region(region_img_array):
            continue
        
        region_img = Image.fromarray(region_img_array)
        output_buffer = BytesIO()
        region_img.save(output_buffer, format='PNG')
        region_bytes = output_buffer.getvalue()
        region_base64 = base64.b64encode(region_bytes).decode('utf-8')
        
        final_regions.append({
            "page_number": region['page_number'],
            "region_index": i + 1,
            "image_data": f"data:image/png;base64,{region_base64}",
            "width": w,
            "height": h,
            "x": x,
            "y": y,
            "format": "png",
            "size_bytes": len(region_bytes),
            "extraction_method": region.get('extraction_method', 'merged'),
            "validated": True
        })
    
    return final_regions

def extract_images_pymupdf(pdf_path):
    """Extract embedded images and diagrams from PDF using PyMuPDF"""
    from PIL import Image
    
    doc = fitz.open(pdf_path)
    embedded_images = []
    page_images = []  # Keep page images for reference
    diagram_regions = []  # Complete diagram regions from page renders
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Get image rectangles for region extraction
        embedded_image_rects = []
        
        # Extract embedded images from the page
        image_list = page.get_images(full=True)
        
        for img_index, img in enumerate(image_list):
            xref = img[0]  # Image reference number
            
            # Check if this is a mask (smask) - masks appear as black/white patterns
            # img[7] contains the smask xref if present
            has_mask = len(img) > 7 and img[7] != 0
            
            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                image_width = base_image["width"]
                image_height = base_image["height"]
                
                # Skip if it's just a mask (not the actual image)
                # Masks are typically grayscale and small
                if has_mask and (image_width < 50 and image_height < 50):
                    # This is likely just the mask, skip it
                    continue
                
                # Filter out very small images (likely icons or decorative elements < 20px)
                # These often appear as black squares
                if image_width < 20 or image_height < 20:
                    continue
                
                # Filter out extremely large images that are likely page backgrounds
                if image_width > 10000 or image_height > 10000:
                    continue
                
                # Process and normalize the image
                try:
                    pil_image = Image.open(BytesIO(image_bytes))
                    
                    # Convert to RGB if needed (handles CMYK, grayscale, etc.)
                    if pil_image.mode not in ('RGB', 'RGBA'):
                        if pil_image.mode == 'P' and 'transparency' in pil_image.info:
                            pil_image = pil_image.convert('RGBA')
                        else:
                            pil_image = pil_image.convert('RGB')
                    
                    # Convert to PNG for consistency and better quality
                    output_buffer = BytesIO()
                    if pil_image.mode == 'RGBA':
                        pil_image.save(output_buffer, format='PNG')
                        image_ext = 'png'
                    else:
                        pil_image.save(output_buffer, format='PNG')
                        image_ext = 'png'
                    
                    image_bytes = output_buffer.getvalue()
                    
                    # Verify the processed image is valid
                    test_img = Image.open(BytesIO(image_bytes))
                    test_img.verify()
                    
                    # Convert to base64
                    img_base64 = base64.b64encode(image_bytes).decode('utf-8')
                    
                    # Check if image is mostly black/white or uniform (likely a mask or corrupted)
                    # Convert to numpy array for better analysis
                    import numpy as np
                    img_array = np.array(pil_image)
                    
                    # Handle different image modes
                    if len(img_array.shape) == 3:
                        # RGB or RGBA - calculate brightness
                        if img_array.shape[2] == 4:  # RGBA
                            brightness = np.mean(img_array[:, :, :3])  # Ignore alpha
                        else:  # RGB
                            brightness = np.mean(img_array)
                        variance = np.var(img_array)
                    else:
                        # Grayscale
                        brightness = np.mean(img_array)
                        variance = np.var(img_array)
                    
                    # Skip if image is too dark (likely black square) or too uniform (likely a mask)
                    # Brightness < 40 means mostly black, variance < 100 means very uniform (solid color)
                    if brightness < 40 or (brightness < 80 and variance < 100):
                        # This is likely a black square or uniform mask - skip it
                        continue
                    
                    # Also check if it's mostly white (likely a background)
                    if brightness > 240 and variance < 500:
                        # Mostly white with low variance - likely a background, skip
                        continue
                    
                    embedded_images.append({
                        "page_number": page_num + 1,
                        "image_index": img_index + 1,
                        "image_data": f"data:image/{image_ext};base64,{img_base64}",
                        "width": image_width,
                        "height": image_height,
                        "format": image_ext,
                        "size_bytes": len(image_bytes),
                        "validated": True,
                        "processed": True,
                        "has_mask": has_mask
                    })
                    
                except Exception as e:
                    # If processing fails, try to use original
                    print(f"Warning: Could not process image on page {page_num + 1}, index {img_index + 1}: {e}")
                    # Skip problematic images rather than including black squares
                    continue
                    
            except Exception as e:
                print(f"Warning: Could not extract image on page {page_num + 1}, index {img_index + 1}: {e}")
                continue
        
        # Extract complete diagram regions from the rendered page
        # This captures vector graphics and complete diagrams that embedded extraction misses
        print(f"  Extracting diagram regions from page {page_num + 1}...")
        try:
            # Get rectangles of embedded images for region extraction
            image_rects = []
            for img_index, img in enumerate(image_list):
                try:
                    # Try to get image placement on page
                    xref = img[0]
                    # Get image instances on this page
                    image_instances = page.get_image_rects(xref)
                    if image_instances:
                        image_rects.extend(image_instances)
                except:
                    pass
            
            regions = extract_diagram_regions_from_page(page, page_num, embedded_image_rects=image_rects, dpi=300)
            diagram_regions.extend(regions)
            print(f"    Found {len(regions)} diagram regions on page {page_num + 1}")
        except Exception as e:
            print(f"    Warning: Could not extract regions from page {page_num + 1}: {e}")
            import traceback
            traceback.print_exc()
        
        # Also keep page render for context (optional)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # Higher quality for better region extraction
        page_img_data = pix.tobytes("png")
        page_img_base64 = base64.b64encode(page_img_data).decode('utf-8')
        
        page_images.append({
            "page_number": page_num + 1,
            "image_data": f"data:image/png;base64,{page_img_base64}",
            "width": pix.width,
            "height": pix.height,
            "is_page_render": True
        })
    
    doc.close()
    return embedded_images, page_images, diagram_regions

def extract_images_pdf2image(pdf_path):
    """Extract page images using pdf2image (requires poppler)"""
    from pdf2image import convert_from_path
    from PIL import Image
    
    pages = convert_from_path(pdf_path, dpi=200)
    page_images = []
    
    for i, page in enumerate(pages, start=1):
        buffered = BytesIO()
        page.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        page_images.append({
            "page_number": i,
            "image_data": f"data:image/png;base64,{img_base64}",
            "width": page.width,
            "height": page.height
        })
    
    return page_images

def add_images_to_existing_json(pdf_path, json_path, output_path=None):
    """Add page images to existing JSON file"""
    
    # Load existing JSON (handle BOM if present)
    with open(json_path, 'r', encoding='utf-8-sig') as f:
        data = json.load(f)
    
    # Extract embedded images and diagrams
    print("Extracting embedded images and diagrams from PDF...")
    if HAS_PYMUPDF:
        print("Using PyMuPDF...")
        embedded_images, page_images, diagram_regions = extract_images_pymupdf(pdf_path)
        print(f"Found {len(embedded_images)} embedded images and {len(diagram_regions)} complete diagram regions across {len(page_images)} pages")
    elif HAS_PDF2IMAGE:
        print("Using pdf2image (will only extract page renders, not embedded images)...")
        page_images = extract_images_pdf2image(pdf_path)
        embedded_images = []
    else:
        print("ERROR: No image extraction library available!")
        print("Please install PyMuPDF: pip install PyMuPDF")
        return None
    
    # Add embedded images and diagram regions to JSON
    data["embedded_images"] = embedded_images
    data["diagram_regions"] = diagram_regions  # Complete diagram regions (preferred)
    data["pages"] = page_images  # Keep page renders for reference
    data["metadata"]["total_pages"] = len(page_images)
    data["metadata"]["embedded_images_count"] = len(embedded_images)
    data["metadata"]["diagram_regions_count"] = len(diagram_regions)
    data["metadata"]["images_extracted"] = True
    
    # Save updated JSON
    if output_path is None:
        output_path = json_path.replace('.json', '_with_images.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n[SUCCESS] Added {len(embedded_images)} embedded images and {len(diagram_regions)} complete diagram regions to JSON!")
    print(f"[FILE] Updated file: {output_path}")
    print(f"[SIZE] File size: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")
    
    # Save embedded images separately with validation
    if embedded_images:
        images_dir = Path(output_path).parent / f"{Path(pdf_path).stem}_embedded_images"
        if images_dir.exists():
            # Remove old directory to ensure clean extraction
            import shutil
            shutil.rmtree(images_dir)
        images_dir.mkdir(exist_ok=True)
        
        valid_count = 0
        invalid_count = 0
        
        for img_data in embedded_images:
            try:
                img_bytes = base64.b64decode(img_data["image_data"].split(",")[1])
                ext = img_data.get("format", "png")
                
                # Validate the image can be opened
                from PIL import Image
                test_img = Image.open(BytesIO(img_bytes))
                test_img.verify()
                
                img_path = images_dir / f"page_{img_data['page_number']:03d}_img_{img_data['image_index']:02d}.{ext}"
                with open(img_path, 'wb') as f:
                    f.write(img_bytes)
                
                # Verify the saved file
                saved_img = Image.open(img_path)
                saved_img.verify()
                valid_count += 1
            except Exception as e:
                print(f"Warning: Could not save image from page {img_data['page_number']}, index {img_data['image_index']}: {e}")
                invalid_count += 1
        
        print(f"[IMAGES] Embedded images saved separately to: {images_dir}")
        print(f"[VALIDATION] Valid images: {valid_count}, Invalid/Skipped: {invalid_count}")
    
    # Save diagram regions separately (these are the complete, intact diagrams)
    if diagram_regions:
        regions_dir = Path(output_path).parent / f"{Path(pdf_path).stem}_diagram_regions"
        if regions_dir.exists():
            import shutil
            shutil.rmtree(regions_dir)
        regions_dir.mkdir(exist_ok=True)
        
        valid_regions = 0
        for region_data in diagram_regions:
            try:
                img_bytes = base64.b64decode(region_data["image_data"].split(",")[1])
                img_path = regions_dir / f"page_{region_data['page_number']:03d}_region_{region_data['region_index']:02d}.png"
                with open(img_path, 'wb') as f:
                    f.write(img_bytes)
                valid_regions += 1
            except Exception as e:
                print(f"Warning: Could not save diagram region from page {region_data['page_number']}: {e}")
        
        print(f"[DIAGRAMS] Complete diagram regions saved to: {regions_dir}")
        print(f"[DIAGRAMS] Saved {valid_regions}/{len(diagram_regions)} diagram regions")
    
    # Also save page renders for reference
    pages_dir = Path(output_path).parent / f"{Path(pdf_path).stem}_page_renders"
    pages_dir.mkdir(exist_ok=True)
    
    for page_data in page_images:
        img_data = base64.b64decode(page_data["image_data"].split(",")[1])
        img_path = pages_dir / f"page_{page_data['page_number']:03d}.png"
        with open(img_path, 'wb') as f:
            f.write(img_data)
    
    print(f"[PAGES] Page renders saved to: {pages_dir}")
    
    return output_path

if __name__ == "__main__":
    pdf_path = r"C:\Users\cameron\Documents\past papers\Life Sciences P1 Nov 2020 Eng (2).pdf"
    
    # Try to find existing JSON file, or create a minimal one
    json_path = r"C:\Users\cameron\Desktop\Life_Sciences_P1_Nov_2020_Eng_2.json"
    if not os.path.exists(json_path):
        # Create minimal JSON structure if it doesn't exist
        print(f"Creating base JSON file: {json_path}")
        base_data = {
            "document_name": "Life Sciences P1 Nov 2020 Eng (2)",
            "extracted_date": "",
            "content": "",
            "metadata": {}
        }
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(base_data, f, indent=2, ensure_ascii=False)
    
    output_path = r"C:\Users\cameron\Desktop\Life_Sciences_P1_Nov_2020_Eng_2_with_images.json"
    
    add_images_to_existing_json(pdf_path, json_path, output_path)

