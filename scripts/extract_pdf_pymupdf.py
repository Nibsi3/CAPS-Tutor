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
from pathlib import Path

# Force UTF-8 encoding for stdout (Windows fix)
try:
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    # Python < 3.7 doesn't have reconfigure
    # The PYTHONIOENCODING env var should handle it
    pass

def extract_image_label(text_blocks, img_rect):
    """
    Try to find a descriptive label for an image by looking at nearby text blocks.
    Mimics the behaviour from the older OCR-based extractor that worked well.
    """
    keywords = ('figure', 'diagram', 'fig', 'image', 'illustration')
    label_text = ""
    
    for block in text_blocks:
        block_text = block.get("text", "").strip()
        if not block_text:
            continue
        
        block_rect = fitz.Rect(*block["bbox"])
        
        # Priority 1: Text that intersects horizontally and sits just above the image
        if (block_rect.y1 <= img_rect.y0 + 10 and
            block_rect.x0 <= img_rect.x1 + 20 and
            block_rect.x1 >= img_rect.x0 - 20):
            lowered = block_text.lower()
            if any(keyword in lowered for keyword in keywords):
                return block_text
            if len(block_text) < 120:
                label_text = block_text  # tentative label
    
    if label_text:
        return label_text.strip()
    
    # Fallback: text directly above with similar horizontal alignment
    for block in text_blocks:
        block_text = block.get("text", "").strip()
        if not block_text:
            continue
        block_rect = fitz.Rect(*block["bbox"])
        if (block_rect.y1 <= img_rect.y0 + 5 and
            abs(block_rect.x0 - img_rect.x0) < 50):
            if len(block_text) < 150:
                return block_text
    
    return ""


def extract_pdf_structured(pdf_path, output_dir):
    """
    Extract text blocks and images with bounding boxes from PDF
    Returns structured JSON for LLM processing
    """
    # Open PDF
    doc = fitz.open(pdf_path)
    
    # Create output directory for images
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    pages_data = []
    
    for page_index, page in enumerate(doc):
        page_num = page_index + 1
        page_data = {
            "page": page_num,
            "text_blocks": [],
            "images": []
        }
        
        page_text = page.get_text()
        page_data["text"] = page_text
        
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
                aspect_ratio = width / height if height > 0 else 0
                
                # Filter out logos/banners/black bars similar to previous workflow
                if width < 150 or height < 150:
                    pix = None
                    continue
                if aspect_ratio > 4 or aspect_ratio < 0.25:
                    pix = None
                    continue
                
                # Detect mostly black images
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
                    except Exception:
                        pass
                
                if total_samples > 0 and (black_pixels / total_samples) > 0.75:
                    pix = None
                    continue
                
                # Save image
                filename = f"page{page_num}_img{img_index}.png"
                filepath = os.path.join(images_dir, filename)
                pix.save(filepath)
                
                # Build data URI for downstream JSON editor
                image_bytes = pix.tobytes("png")
                data_uri = f"data:image/png;base64,{base64.b64encode(image_bytes).decode('utf-8')}"
                
                label_text = extract_image_label(page_data["text_blocks"], rect) or None
                
                page_data["images"].append({
                    "path": filepath,
                    "filename": filename,
                    "bbox": bbox,
                    "width": width,
                    "height": height,
                    "xref": xref,
                    "page": page_num,
                    "dataUri": data_uri,
                    "label": label_text
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
        "pages": pages_data
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

