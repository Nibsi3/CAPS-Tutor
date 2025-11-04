#!/usr/bin/env python3
"""
Script to convert PDF pages to images for vision model processing.
Uses PyMuPDF (fitz) to render PDF pages as images.
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


def convert_pdf_pages_to_images(pdf_path, dpi=150):
    """
    Convert each page of a PDF to a JPEG image and return as base64 data URIs.
    
    Args:
        pdf_path: Path to the PDF file
        dpi: Resolution for rendering (default 150, higher = better quality but larger)
        
    Returns:
        List of dictionaries with page image data:
        {
            'page': int (1-indexed),
            'dataUri': str,  # base64 data URI
            'width': int,
            'height': int,
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
            
            # Render page to image (pixmap)
            # dpi determines quality/resolution
            mat = fitz.Matrix(dpi / 72, dpi / 72)  # 72 is the default DPI
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to image bytes (PNG format)
            image_bytes = pix.tobytes("png")
            
            # Create base64 data URI
            base64_encoded = base64.b64encode(image_bytes).decode('utf-8')
            data_uri = f"data:image/png;base64,{base64_encoded}"
            
            images.append({
                'page': page_num + 1,  # 1-indexed
                'dataUri': data_uri,
                'width': pix.width,
                'height': pix.height,
            })
        
        doc.close()
        return images
        
    except Exception as e:
        print(f"ERROR: Failed to process PDF {pdf_path}: {e}")
        return []


def main():
    if len(sys.argv) < 2:
        print("Usage: python pdf-to-images.py <pdf_file> [dpi]")
        print("Example: python pdf-to-images.py \"past papers/Dance Studies Nov 2020 Eng.pdf\" 150")
        print("Default DPI is 150. Higher DPI = better quality but larger file size.")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    dpi = int(sys.argv[2]) if len(sys.argv) > 2 else 150
    
    if not pdf_path.lower().endswith('.pdf'):
        print("ERROR: Input must be a PDF file")
        sys.exit(1)
    
    print(f"Converting PDF pages to images: {pdf_path} (DPI: {dpi})")
    images = convert_pdf_pages_to_images(pdf_path, dpi)
    
    if not images:
        print("No pages found in PDF")
        sys.exit(0)
    
    print(f"Converted {len(images)} pages to images")
    
    # Output as JSON
    output = json.dumps({
        'pdf_file': pdf_path,
        'dpi': dpi,
        'total_pages': len(images),
        'pages': images
    }, indent=2)
    
    # Save to a file
    output_file = pdf_path.replace('.pdf', '_pages.json')
    with open(output_file, 'w') as f:
        f.write(output)
    print(f"\nResults saved to: {output_file}")
    print("\n" + "="*80)
    print("FIRST PAGE (preview):")
    print("="*80)
    print(images[0]['dataUri'][:200] + "...")


if __name__ == "__main__":
    main()

