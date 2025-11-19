#!/usr/bin/env python3
"""
PDF Extraction Worker using PyMuPDF
Extracts text blocks with bounding boxes and images with bboxes
Outputs structured JSON for processing by Node.js worker
"""

import fitz  # PyMuPDF
import os
import json
import uuid
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional

def extract_pdf_with_images(pdf_path: str, output_dir: str) -> Dict[str, Any]:
    """
    Extract text blocks and images from PDF with bounding boxes.
    
    Args:
        pdf_path: Path to input PDF file
        output_dir: Directory to save extracted images and JSON
    
    Returns:
        Dictionary with pages array containing text_blocks and images
    """
    os.makedirs(output_dir, exist_ok=True)
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    doc = fitz.open(pdf_path)
    result = {
        "pages": [],
        "metadata": {
            "totalPages": len(doc),
            "pdfPath": pdf_path,
            "extractionDate": str(fitz.get_pdf_now()),
        }
    }
    
    for p in range(len(doc)):
        page = doc[p]
        page_dict = {
            "pageNumber": p + 1,
            "text_blocks": [],
            "images": [],
            "pageWidth": page.rect.width,
            "pageHeight": page.rect.height,
        }
        
        # Extract text blocks with bounding boxes
        try:
            raw = page.get_text("dict")
            for block in raw.get("blocks", []):
                if block.get("type") == 0:  # Text block
                    lines_text = []
                    for line in block.get("lines", []):
                        line_text = ""
                        for span in line.get("spans", []):
                            line_text += span.get("text", "")
                        if line_text.strip():
                            lines_text.append(line_text)
                    
                    if lines_text:
                        page_dict["text_blocks"].append({
                            "bbox": block.get("bbox", [0, 0, 0, 0]),
                            "text": "\n".join(lines_text),
                            "lines": lines_text,
                        })
        except Exception as e:
            print(f"Warning: Error extracting text from page {p+1}: {e}", file=sys.stderr)
        
        # Extract images with bounding boxes
        try:
            images = page.get_images(full=True)
            
            # Get page dict once for both text and image blocks
            try:
                page_dict_raw = page.get_text("dict")
                # Extract image blocks from page dict
                image_blocks = [block for block in page_dict_raw.get("blocks", []) if block.get("type") == 1]
            except Exception as e:
                print(f"Warning: Error getting page dict for images on page {p+1}: {e}", file=sys.stderr)
                image_blocks = []
            
            for img_index, img in enumerate(images):
                xref = img[0]
                try:
                    # Extract image
                    pix = fitz.Pixmap(doc, xref)
                    if pix.n > 4:  # Convert CMYK to RGB
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    
                    # Generate filename (consistent with existing format)
                    filename = f"page{p+1}_img{img_index}.png"
                    out_path = os.path.join(images_dir, filename)
                    
                    # Save image (only if valid dimensions)
                    if pix.width > 0 and pix.height > 0:
                        pix.save(out_path)
                    else:
                        print(f"Warning: Skipping invalid image {img_index} on page {p+1} (dimensions: {pix.width}x{pix.height})", file=sys.stderr)
                        pix = None
                        continue
                    
                    # Find bbox for this image
                    bbox = None
                    # Try to match by xref in image blocks
                    for block in image_blocks:
                        if block.get("image") == xref:
                            bbox = block.get("bbox")
                            break
                    
                    # Fallback: use image block bbox by index if no xref match
                    if bbox is None and img_index < len(image_blocks):
                        bbox = image_blocks[img_index].get("bbox")
                    
                    # Final fallback: use page dimensions (centered)
                    if bbox is None:
                        bbox = [0, 0, page.rect.width, page.rect.height]
                    
                    page_dict["images"].append({
                        "filename": filename,
                        "path": out_path,
                        "xref": xref,
                        "bbox": bbox,
                        "width": pix.width,
                        "height": pix.height,
                    })
                    
                    pix = None  # Free memory
                except Exception as e:
                    print(f"Warning: Error extracting image {img_index} from page {p+1}: {e}", file=sys.stderr)
                    continue
        except Exception as e:
            print(f"Warning: Error processing images on page {p+1}: {e}", file=sys.stderr)
        
        result["pages"].append(page_dict)
    
    doc.close()
    
    # Write extraction JSON
    json_path = os.path.join(output_dir, "extraction.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    return result


def main():
    """CLI entry point for extraction worker"""
    if len(sys.argv) < 3:
        print("Usage: python extract_pdf_worker.py <pdf_path> <output_dir>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    try:
        result = extract_pdf_with_images(pdf_path, output_dir)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

