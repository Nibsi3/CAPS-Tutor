"""
Action 1: Extract PDFs & Parse Metadata
Extracts text and images from PDFs using PyMuPDF + OpenCV for image processing
Uses LangChain for structured JSON output
"""

import fitz  # PyMuPDF
import json
import os
import re
import base64
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional

# Try to import OpenCV
try:
    import cv2
    import numpy as np
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
    print("Warning: OpenCV not available. Install with: pip install opencv-python numpy")

# Try to import LangChain
try:
    from langchain.output_parsers import PydanticOutputParser
    from langchain.prompts import PromptTemplate
    from pydantic import BaseModel, Field
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    print("Warning: LangChain not available. Using basic JSON structuring.")

# Folder where all PDFs are stored
# Try both "past papers" (with space) and "past_papers" (without space) for compatibility
_past_papers_with_space = os.path.join(os.path.dirname(os.path.dirname(__file__)), "past papers")
_past_papers_no_space = os.path.join(os.path.dirname(os.path.dirname(__file__)), "past_papers")
if os.path.exists(_past_papers_with_space):
    PDF_FOLDER = _past_papers_with_space
elif os.path.exists(_past_papers_no_space):
    PDF_FOLDER = _past_papers_no_space
else:
    # Default to past_papers (no space) - create it if needed
    PDF_FOLDER = _past_papers_no_space
    os.makedirs(PDF_FOLDER, exist_ok=True)

OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "extracted_papers")


def parse_metadata(filename: str) -> tuple:
    """
    Parse metadata from filename.
    Example filename: 'Life Sciences P1 Nov 2020 Eng (2).pdf'
    """
    name = os.path.splitext(filename)[0]
    
    # Remove common suffixes like "(2)", "(1)", etc.
    name = re.sub(r'\s*\(\d+\)\s*$', '', name)
    
    # Regex for paper and year
    paper_match = re.search(r"P(\d+)", name, re.IGNORECASE)
    year_match = re.search(r"(\d{4})", name)
    
    paper = f"Paper {paper_match.group(1)}" if paper_match else "Paper 1"
    year = int(year_match.group(1)) if year_match else 2020
    
    # Subject = everything before P1 or year, remove common words
    subject = re.sub(r"P\d+.*", "", name).strip()
    subject = re.sub(r"\b(Nov|Memo|Afr|Eng|Eastern Cape|Free State|KwaZulu-Natal|Limpopo|Mpumalanga|North West|Northern Cape|Western Cape)\b", "", subject, flags=re.IGNORECASE).strip()
    subject = re.sub(r"\s+", " ", subject).strip()
    
    # Grade mapping (all Grade 12 for now)
    grade = 12
    
    return subject, grade, paper, year


def process_image_with_opencv(image_path: str) -> Optional[Dict[str, Any]]:
    """
    Process image with OpenCV for enhancement and analysis.
    Returns image metadata and enhanced image path.
    """
    if not OPENCV_AVAILABLE:
        return None
    
    try:
        # Read image with OpenCV
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        height, width = img.shape[:2]
        
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect edges (useful for diagram detection)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (width * height)
        
        # Check if image is mostly text/diagram (high edge density) vs photo
        is_diagram = edge_density > 0.1
        
        # Enhance contrast for better OCR if needed
        enhanced_path = image_path
        if is_diagram:
            # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)
            enhanced_path = image_path.replace('.png', '_enhanced.png')
            cv2.imwrite(enhanced_path, enhanced)
        
        # Calculate image statistics
        mean_brightness = np.mean(gray)
        std_dev = np.std(gray)
        
        return {
            'width': width,
            'height': height,
            'is_diagram': is_diagram,
            'edge_density': float(edge_density),
            'mean_brightness': float(mean_brightness),
            'std_dev': float(std_dev),
            'enhanced_path': enhanced_path if is_diagram else image_path
        }
    except Exception as e:
        print(f"  ⚠ OpenCV processing error: {e}", file=sys.stderr)
        # Fallback: just get dimensions
        try:
            img = cv2.imread(image_path)
            if img is not None:
                height, width = img.shape[:2]
                return {
                    'width': width,
                    'height': height,
                    'is_diagram': None,
                    'edge_density': None,
                    'mean_brightness': None,
                    'std_dev': None,
                    'enhanced_path': image_path
                }
        except:
            pass
        return None


def is_valid_image(pix, width: int, height: int, page_num: int, img_index: int) -> bool:
    """
    Check if an image should be included (filters out logos, headers, black bars).
    """
    if not pix:
        return False
    
    aspect_ratio = width / height if height > 0 else 0
    
    # Skip very small images (likely icons/logos)
    if width < 150 or height < 150:
        print(f"  Skipping small image ({width}x{height}) on page {page_num} - likely logo/icon", file=sys.stderr)
        return False
    
    # Skip very wide images (likely headers/banners)
    if aspect_ratio > 4:
        print(f"  Skipping wide banner image ({width}x{height}) on page {page_num} - likely header/logo", file=sys.stderr)
        return False
    
    # Skip very tall thin images (likely sidebars)
    if aspect_ratio < 0.25:
        print(f"  Skipping tall thin image ({width}x{height}) on page {page_num} - likely sidebar", file=sys.stderr)
        return False
    
    # Check if image is mostly black (broken/placeholder/black bars)
    sample_points = []
    for sy in range(0, min(10, height), max(1, height // 10)):
        for sx in range(0, min(10, width), max(1, width // 10)):
            if sx < width and sy < height:
                sample_points.append((sx, sy))
    
    black_pixels = 0
    total_samples = min(100, len(sample_points))
    
    for x, y in sample_points[:total_samples]:
        try:
            pixel = pix.pixel(x, y)
            r = (pixel >> 16) & 0xFF
            g = (pixel >> 8) & 0xFF
            b = pixel & 0xFF
            if r < 40 and g < 40 and b < 40:
                black_pixels += 1
        except:
            pass
    
    # Skip if more than 75% of sampled pixels are black
    if total_samples > 0 and (black_pixels / total_samples) > 0.75:
        print(f"  Skipping mostly black image ({width}x{height}) on page {page_num} - likely black bar/placeholder", file=sys.stderr)
        return False
    
    return True


def find_image_label(text_blocks: List, img_rect, page_num: int) -> Optional[str]:
    """
    Find the label/caption for an image by looking at nearby text blocks.
    """
    label_text = ""
    
    for block in text_blocks:
        if len(block) >= 5:
            bx0, by0, bx1, by1 = block[0], block[1], block[2], block[3]
            block_text = block[4] if len(block) > 4 else ""
            block_rect = fitz.Rect(bx0, by0, bx1, by1)
            
            # If block is above or intersects horizontally with image
            if (block_rect.y1 <= img_rect.y0 + 10 and 
                block_rect.x0 <= img_rect.x1 + 20 and 
                block_rect.x1 >= img_rect.x0 - 20):
                block_text_clean = block_text.strip()
                if block_text_clean:
                    # Check for common label patterns
                    if any(keyword in block_text_clean.lower() for keyword in 
                           ['figure', 'diagram', 'fig', 'image', 'illustration']):
                        label_text = block_text_clean
                        break
                    elif len(block_text_clean) < 100:
                        label_text += block_text_clean + " "
    
    # If no label found, try looking for text immediately above
    if not label_text:
        for block in text_blocks:
            if len(block) >= 5:
                bx0, by0, bx1, by1 = block[0], block[1], block[2], block[3]
                block_text = block[4] if len(block) > 4 else ""
                block_rect = fitz.Rect(bx0, by0, bx1, by1)
                
                if (block_rect.y1 <= img_rect.y0 + 5 and
                    abs(block_rect.x0 - img_rect.x0) < 50):
                    block_text_clean = block_text.strip()
                    if block_text_clean and len(block_text_clean) < 150:
                        label_text = block_text_clean
                        break
    
    return label_text.strip() if label_text else None


def structure_with_langchain(extracted_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Use LangChain to structure the extracted data into a well-formed JSON.
    """
    if not LANGCHAIN_AVAILABLE:
        # Fallback: return data as-is
        return extracted_data
    
    try:
        # Validate structure (basic validation without full Pydantic)
        if not isinstance(extracted_data, dict):
            return extracted_data
        
        # Ensure required fields exist
        required_fields = ['pdf', 'subject', 'grade', 'paper', 'year', 'pages']
        for field in required_fields:
            if field not in extracted_data:
                print(f"  ⚠ Missing required field: {field}", file=sys.stderr)
        
        # Validate pages structure
        if 'pages' in extracted_data and isinstance(extracted_data['pages'], list):
            for page in extracted_data['pages']:
                if not isinstance(page, dict):
                    continue
                if 'images' in page and isinstance(page['images'], list):
                    for img in page['images']:
                        if not isinstance(img, dict):
                            continue
                        # Ensure image has required fields
                        if 'dataUri' not in img and 'path' in img:
                            # Try to read and convert to dataUri if missing
                            try:
                                img_path = os.path.join(
                                    os.path.dirname(extracted_data.get('json_path', '')),
                                    img['path']
                                )
                                if os.path.exists(img_path):
                                    with open(img_path, 'rb') as f:
                                        img_data = f.read()
                                        base64_encoded = base64.b64encode(img_data).decode('utf-8')
                                        img['dataUri'] = f"data:image/png;base64,{base64_encoded}"
                            except:
                                pass
        
        return extracted_data
    except Exception as e:
        print(f"  ⚠ LangChain structuring error: {e}, using raw data", file=sys.stderr)
        return extracted_data


def extract_pdf(path: str) -> tuple:
    """Extract text and images from a PDF file."""
    doc = fitz.open(path)
    base = os.path.splitext(os.path.basename(path))[0]
    pdf_filename = os.path.basename(path)
    
    # Parse metadata from filename
    subject, grade, paper, year = parse_metadata(pdf_filename)
    
    # Create output directory
    output_dir = os.path.join(OUTPUT_FOLDER, base)
    img_dir = os.path.join(output_dir, "images")
    os.makedirs(img_dir, exist_ok=True)
    
    # Initialize output with metadata
    output = {
        "pdf": pdf_filename,
        "subject": subject,
        "grade": grade,
        "paper": paper,
        "year": year,
        "pages": []
    }
    
    print(f"  Processing {len(doc)} pages...", file=sys.stderr)
    
    for page_num, page in enumerate(doc, start=1):
        try:
            # Get full text from page
            text = page.get_text()
            
            # Get text blocks with coordinates for finding image labels
            text_blocks = page.get_text("blocks")
            images = []
            
            # Extract images with coordinates and labels
            image_list = page.get_images(full=True)
            print(f"    Page {page_num}: Found {len(image_list)} image(s)", file=sys.stderr)
            
            for img_index, img in enumerate(image_list, start=1):
                try:
                    xref = img[0]
                    
                    # Get image rectangle coordinates
                    img_rects = page.get_image_rects(xref)
                    if not img_rects:
                        continue
                    
                    img_rect = img_rects[0]
                    
                    pix = fitz.Pixmap(doc, xref)
                    
                    # Convert to RGB if necessary
                    if pix.n - pix.alpha >= 4:  # CMYK
                        pix1 = fitz.Pixmap(fitz.csRGB, pix)
                        pix = pix1
                        pix1 = None
                    
                    width = pix.width
                    height = pix.height
                    
                    # Validate image before processing
                    if not is_valid_image(pix, width, height, page_num, img_index):
                        pix = None
                        continue
                    
                    # Save image file
                    img_filename = f"page_{page_num}_img_{img_index}.png"
                    img_path = os.path.join(img_dir, img_filename)
                    pix.save(img_path)
                    
                    # Process with OpenCV if available
                    opencv_data = None
                    if OPENCV_AVAILABLE:
                        opencv_data = process_image_with_opencv(img_path)
                        if opencv_data and opencv_data.get('enhanced_path') and os.path.exists(opencv_data['enhanced_path']):
                            # Use enhanced image if available
                            enhanced_path = opencv_data['enhanced_path']
                            if enhanced_path != img_path:
                                # Read enhanced image and update base64
                                try:
                                    enhanced_img = cv2.imread(enhanced_path)
                                    if enhanced_img is not None:
                                        # Save enhanced version
                                        cv2.imwrite(img_path, enhanced_img)
                                except:
                                    pass
                    
                    # Convert to base64 data URI
                    image_bytes = pix.tobytes("png")
                    base64_encoded = base64.b64encode(image_bytes).decode('utf-8')
                    data_uri = f"data:image/png;base64,{base64_encoded}"
                    
                    # Find label for image
                    label_text = find_image_label(text_blocks, img_rect, page_num)
                    
                    image_data = {
                        "path": f"images/{img_filename}",
                        "filename": img_filename,
                        "dataUri": data_uri,
                        "width": width,
                        "height": height,
                        "rect": [round(img_rect.x0, 2), round(img_rect.y0, 2), 
                                round(img_rect.x1, 2), round(img_rect.y1, 2)],
                        "label": label_text
                    }
                    
                    # Add OpenCV analysis data if available
                    if opencv_data:
                        image_data["opencv_analysis"] = {
                            "is_diagram": opencv_data.get('is_diagram'),
                            "edge_density": opencv_data.get('edge_density'),
                            "mean_brightness": opencv_data.get('mean_brightness'),
                            "std_dev": opencv_data.get('std_dev')
                        }
                    
                    images.append(image_data)
                    
                    pix = None
                    print(f"      ✓ Extracted image {img_index}: {img_filename} ({width}x{height})", file=sys.stderr)
                    
                except Exception as e:
                    print(f"      ⚠ Warning: Could not extract image {img_index} from page {page_num}: {e}", file=sys.stderr)
                    continue
            
            output["pages"].append({
                "page": page_num,
                "text": text,
                "images": images
            })
            
        except Exception as e:
            print(f"  ⚠ Error processing page {page_num}: {e}", file=sys.stderr)
            output["pages"].append({
                "page": page_num,
                "text": "",
                "images": []
            })
    
    doc.close()
    
    # Store json_path for LangChain processing
    json_path = os.path.join(output_dir, f"{base}_extracted.json")
    output["json_path"] = json_path
    
    # Structure with LangChain if available
    structured_output = structure_with_langchain(output)
    
    # Remove json_path from final output
    structured_output.pop("json_path", None)
    
    # Save JSON output
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(structured_output, f, indent=2, ensure_ascii=False)
    
    total_images = sum(len(page["images"]) for page in structured_output["pages"])
    print(f"  ✓ Extracted {len(structured_output['pages'])} pages, {total_images} images", file=sys.stderr)
    print(f"  ✓ Saved JSON to: {json_path}", file=sys.stderr)
    
    return json_path, img_dir


def main():
    """Main function to process PDFs."""
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    
    # Filter for Life Sciences P1 only (for testing)
    # Remove the filter to process all PDFs
    filter_subject = "Life Sciences"
    filter_paper = "P1"
    
    all_pdfs = []
    
    if not os.path.exists(PDF_FOLDER):
        print(f"Error: PDF folder not found: {PDF_FOLDER}", file=sys.stderr)
        print(f"Expected path: {os.path.abspath(PDF_FOLDER)}", file=sys.stderr)
        return []
    
    pdf_files = [f for f in os.listdir(PDF_FOLDER) if f.endswith(".pdf")]
    
    if not pdf_files:
        print(f"No PDF files found in: {PDF_FOLDER}", file=sys.stderr)
        return []
    
    print(f"Found {len(pdf_files)} PDF file(s) in folder\n", file=sys.stderr)
    
    for pdf_file in pdf_files:
        # Skip memos for now
        if "Memo" in pdf_file:
            print(f"Skipping memo: {pdf_file}", file=sys.stderr)
            continue
        
        # Filter for testing
        if filter_subject and filter_subject.lower() not in pdf_file.lower():
            continue
        if filter_paper and filter_paper.upper() not in pdf_file.upper():
            continue
        
        pdf_path = os.path.join(PDF_FOLDER, pdf_file)
        print(f"\n{'='*80}", file=sys.stderr)
        print(f"Processing: {pdf_file}", file=sys.stderr)
        print(f"{'='*80}", file=sys.stderr)
        
        try:
            json_file, images_folder = extract_pdf(pdf_path)
            subject, grade, paper, year = parse_metadata(pdf_file)
            
            all_pdfs.append({
                "pdf": pdf_file,
                "json": json_file,
                "images": images_folder,
                "subject": subject,
                "grade": grade,
                "paper": paper,
                "year": year
            })
            
            print(f"\n✓ Successfully processed: {subject} {paper} {year}", file=sys.stderr)
        except Exception as e:
            print(f"\n✗ Error processing {pdf_file}: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc()
            continue
    
    # Save metadata summary
    summary_path = os.path.join(OUTPUT_FOLDER, "extraction_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(all_pdfs, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*80}", file=sys.stderr)
    print(f"[SUCCESS] Processed {len(all_pdfs)} PDF(s)", file=sys.stderr)
    print(f"[SUCCESS] Summary saved to: {summary_path}", file=sys.stderr)
    print(f"{'='*80}\n", file=sys.stderr)
    
    return all_pdfs


if __name__ == "__main__":
    result = main()
    if result:
        print(f"\nExtraction complete! Processed {len(result)} PDF(s).", file=sys.stderr)
    else:
        print("\nNo PDFs were processed.", file=sys.stderr)
