#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF Extraction using PyMuPDF (fitz)
Extracts text blocks and images with bounding boxes for proper question reconstruction
"""

import sys
import json
import fitz  # PyMuPDF
import os
import base64
import re

# Force UTF-8 encoding for stdout (Windows fix)
try:
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    # Python < 3.7 doesn't have reconfigure
    # The PYTHONIOENCODING env var should handle it
    pass

def parse_metadata(filename):
    """
    Parse subject, grade, paper, year, and language metadata from filename.
    Expected formats like 'Life Sciences P1 Nov 2020 Eng (2).pdf'
    """
    name = os.path.splitext(filename)[0]

    # Remove trailing copy indicators e.g. (2), (Final)
    name = re.sub(r'\s*\([\w\d]+\)\s*$', '', name).strip()

    paper_match = re.search(r'\bP(?:aper)?\s*(\d+)\b', name, re.IGNORECASE)
    year_match = re.search(r'(19|20)\d{2}', name)

    paper = f"Paper {paper_match.group(1)}" if paper_match else "Paper 1"
    year = int(year_match.group(0)) if year_match else None

    # Remove paper and year tokens to isolate subject
    subject_part = re.sub(r'\bP(?:aper)?\s*\d+\b', '', name, flags=re.IGNORECASE)
    if year:
        subject_part = subject_part.replace(str(year), '')
    subject_part = re.sub(r'\b(Nov|June|Eng|Afr|Memo|Addendum|Final)\b', '', subject_part, flags=re.IGNORECASE)
    subject = re.sub(r'\s+', ' ', subject_part).strip() or "Unknown"

    # Determine grade heuristically (default Grade 12)
    grade = 12

    language = "English"
    if re.search(r'\bafr\b', name, re.IGNORECASE):
        language = "Afrikaans"

    return {
        "subject": subject,
        "grade": grade,
        "paper": paper,
        "year": year,
        "language": language,
    }


def image_is_mostly_black(pix):
    """Detect placeholder/black bar images by sampling pixels."""
    sample_points = []
    width, height = pix.width, pix.height
    for sy in range(0, min(10, height), max(1, height // 10 or 1)):
        for sx in range(0, min(10, width), max(1, width // 10 or 1)):
            if sx < width and sy < height:
                sample_points.append((sx, sy))

    if not sample_points:
        return False

    black_pixels = 0
    for x, y in sample_points[:100]:
        try:
            pixel = pix.pixel(x, y)
            r = (pixel >> 16) & 0xFF
            g = (pixel >> 8) & 0xFF
            b = pixel & 0xFF
            if r < 40 and g < 40 and b < 40:
                black_pixels += 1
        except Exception:
            continue

    return (black_pixels / len(sample_points)) > 0.75


def find_image_label(text_blocks, img_rect):
    """Attempt to find the caption/label associated with an image."""
    label_text = ""
    tolerant_rect = fitz.Rect(img_rect.x0 - 20, img_rect.y0 - 20, img_rect.x1 + 20, img_rect.y1 + 20)

    for block in text_blocks:
        if len(block) < 5:
            continue
        bx0, by0, bx1, by1 = block[0], block[1], block[2], block[3]
        block_text = block[4] if len(block) > 4 else ""
        block_rect = fitz.Rect(bx0, by0, bx1, by1)

        if block_rect.intersects(tolerant_rect) or block_rect.y1 <= img_rect.y0 + 10:
            block_text_clean = block_text.strip()
            if not block_text_clean:
                continue
            if re.search(r'\b(figure|fig|diagram|image|illustration)\b', block_text_clean, re.IGNORECASE):
                return block_text_clean
            if len(block_text_clean) < 120:
                label_text += block_text_clean + " "

    return label_text.strip() or None


def image_to_data_uri(pix):
    """Convert pixmap to PNG data URI."""
    image_bytes = pix.tobytes("png")
    encoded = base64.b64encode(image_bytes).decode('utf-8')
    return f"data:image/png;base64,{encoded}"


def extract_pdf_structured(pdf_path, output_dir):
    """
    Extract text blocks and images with bounding boxes from PDF
    Returns structured JSON for LLM processing
    """
    # Open PDF
    doc = fitz.open(pdf_path)

    metadata = parse_metadata(os.path.basename(pdf_path))
    
    # Create output directory for images
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    pages_data = []
    
    for page_index, page in enumerate(doc):
        page_num = page_index + 1
        page_text = page.get_text("text")
        page_data = {
            "page": page_num,
            "text": page_text,
            "text_blocks": [],
            "images": []
        }
        
        # Extract text blocks with bounding boxes
        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            if block["type"] == 0:  # Text block
                bbox = block["bbox"]  # [x0, y0, x1, y1]
                text_content = ""
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        text_content += span.get("text", "")
                    text_content += "\n"
                
                if text_content.strip():
                    page_data["text_blocks"].append({
                        "bbox": [round(bbox[0], 2), round(bbox[1], 2), 
                                round(bbox[2], 2), round(bbox[3], 2)],
                        "text": text_content.strip()
                    })
        
        # Extract images with bounding boxes
        image_list = page.get_images(full=True)
        for img_index, img in enumerate(image_list):
            xref = img[0]
            
            # Get image bounding box
            img_rects = page.get_image_rects(xref)
            if not img_rects:
                continue
            
            # Use first rectangle (images can appear multiple times)
            rect = img_rects[0]
            bbox = [round(rect.x0, 2), round(rect.y0, 2), 
                   round(rect.x1, 2), round(rect.y1, 2)]
            
            # Extract image
            try:
                pix = fitz.Pixmap(doc, xref)
                
                # Convert CMYK to RGB if needed
                if pix.n > 4:
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                
                width = pix.width
                height = pix.height
                aspect_ratio = width / height if height else 0

                # Skip tiny logos or banners similar to legacy extractor
                if width < 150 or height < 150:
                    pix = None
                    continue
                if aspect_ratio > 4 or aspect_ratio < 0.25:
                    pix = None
                    continue
                if image_is_mostly_black(pix):
                    pix = None
                    continue

                filename = f"page{page_num}_img{img_index}.png"
                filepath = os.path.join(images_dir, filename)
                pix.save(filepath)

                data_uri = image_to_data_uri(pix)
                label = find_image_label(blocks, rect)

                page_data["images"].append({
                    "path": filepath,
                    "filename": filename,
                    "bbox": bbox,
                    "width": width,
                    "height": height,
                    "xref": xref,
                    "dataUri": data_uri,
                    "label": label
                })
                
                pix = None  # Free memory
            except Exception as e:
                print(f"Warning: Could not extract image {img_index} on page {page_num}: {e}", 
                     file=sys.stderr)
        
        pages_data.append(page_data)
    
    doc.close()
    
    return {
        "filename": os.path.basename(pdf_path),
        "num_pages": len(pages_data),
        "pages": pages_data,
        "metadata": metadata
    }


def main():
    if len(sys.argv) < 3:
        print("Usage: python extract_pdf_pymupdf.py <pdf_path> <output_dir>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract PDF
    result = extract_pdf_structured(pdf_path, output_dir)
    
    # Save JSON
    json_path = os.path.join(output_dir, "extraction.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    # Print result to stdout
    print(json.dumps(result, ensure_ascii=False))
    
    print(f"\n✓ Extracted {result['num_pages']} pages", file=sys.stderr)
    print(f"✓ JSON saved to: {json_path}", file=sys.stderr)
    print(f"✓ Images saved to: {os.path.join(output_dir, 'images')}", file=sys.stderr)


if __name__ == "__main__":
    main()

