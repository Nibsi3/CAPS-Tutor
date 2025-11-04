#!/usr/bin/env python3
"""
Script to extract images from PDF files for Dance Studies and other visual subjects.
Uses PyMuPDF (fitz) to extract embedded images from PDFs.
"""

import sys
import os
import base64
import json
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("ERROR: PyMuPDF not installed. Install it with: pip install pymupdf")
    sys.exit(1)


def extract_images_from_pdf(pdf_path):
    """
    Extract all images from a PDF file and return them as base64 data URIs.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        List of dictionaries with image data:
        {
            'page': int,
            'image_index': int,
            'dataUri': str,  # base64 data URI
            'format': str,   # jpg, png, etc.
        }
    """
    if not os.path.exists(pdf_path):
        print(f"ERROR: PDF file not found: {pdf_path}")
        return []
    
    try:
        doc = fitz.open(pdf_path)
        images = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images(full=True)
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                try:
                    # Extract the image
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    
                    # Create base64 data URI
                    mime_type = f"image/{image_ext}"
                    if image_ext == "jpg":
                        mime_type = "image/jpeg"
                    elif image_ext == "bmp":
                        mime_type = "image/bmp"
                    
                    base64_encoded = base64.b64encode(image_bytes).decode('utf-8')
                    data_uri = f"data:{mime_type};base64,{base64_encoded}"
                    
                    images.append({
                        'page': page_num + 1,
                        'image_index': img_index,
                        'dataUri': data_uri,
                        'format': image_ext,
                        'width': base_image.get('width', 'unknown'),
                        'height': base_image.get('height', 'unknown'),
                    })
                except Exception as e:
                    print(f"Warning: Could not extract image {xref} from page {page_num + 1}: {e}")
                    continue
        
        doc.close()
        return images
        
    except Exception as e:
        print(f"ERROR: Failed to process PDF {pdf_path}: {e}")
        return []


def main():
    if len(sys.argv) < 2:
        print("Usage: python extract-pdf-images.py <pdf_file>")
        print("Example: python extract-pdf-images.py \"past papers/Dance Studies Nov 2020 Eng.pdf\"")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not pdf_path.lower().endswith('.pdf'):
        print("ERROR: Input must be a PDF file")
        sys.exit(1)
    
    print(f"Extracting images from: {pdf_path}")
    images = extract_images_from_pdf(pdf_path)
    
    if not images:
        print("No images found in PDF")
        sys.exit(0)
    
    print(f"Found {len(images)} images in the PDF")
    
    # Output as JSON
    output = json.dumps({
        'pdf_file': pdf_path,
        'total_images': len(images),
        'images': images
    }, indent=2)
    
    print("\n" + "="*80)
    print("EXTRACTED IMAGES:")
    print("="*80)
    print(output)
    
    # Also save to a file
    output_file = pdf_path.replace('.pdf', '_images.json')
    with open(output_file, 'w') as f:
        f.write(output)
    print(f"\nResults saved to: {output_file}")


if __name__ == "__main__":
    main()

