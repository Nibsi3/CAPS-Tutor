#!/usr/bin/env python3
"""
Script to convert PDF base64 data URI to images for vision model processing.
Reads base64 PDF from stdin, outputs JSON with base64 image data URIs.
Uses PyMuPDF (fitz) to render PDF pages as images.
"""

import sys
import base64
import json

try:
    import fitz  # PyMuPDF
except ImportError:
    print("ERROR: PyMuPDF not installed. Install it with: pip install pymupdf", file=sys.stderr)
    sys.exit(1)


def convert_pdf_base64_to_images(pdf_base64_data_uri, dpi=150):
    """
    Convert each page of a base64 PDF data URI to images.
    
    Args:
        pdf_base64_data_uri: Base64 data URI (e.g., "data:application/pdf;base64,...")
        dpi: Resolution for rendering (default 150)
        
    Returns:
        List of base64 data URIs for each page image
    """
    try:
        # Extract base64 data from data URI
        if pdf_base64_data_uri.startswith('data:'):
            base64_data = pdf_base64_data_uri.split(',')[1]
        else:
            base64_data = pdf_base64_data_uri
        
        # Decode base64 to PDF bytes
        pdf_bytes = base64.b64decode(base64_data)
        
        # Open PDF from memory
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        images = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Render page to image (pixmap)
            mat = fitz.Matrix(dpi / 72, dpi / 72)
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to image bytes (PNG format)
            image_bytes = pix.tobytes("png")
            
            # Create base64 data URI
            base64_encoded = base64.b64encode(image_bytes).decode('utf-8')
            data_uri = f"data:image/png;base64,{base64_encoded}"
            
            images.append(data_uri)
        
        doc.close()
        return images
        
    except Exception as e:
        print(f"ERROR: Failed to process PDF: {e}", file=sys.stderr)
        return []


def main():
    # Read base64 PDF data URI from stdin
    pdf_data_uri = sys.stdin.read().strip()
    
    if not pdf_data_uri:
        print("ERROR: No PDF data provided", file=sys.stderr)
        sys.exit(1)
    
    # Convert to images
    images = convert_pdf_base64_to_images(pdf_data_uri, dpi=150)
    
    if not images:
        print("ERROR: Failed to convert PDF to images", file=sys.stderr)
        sys.exit(1)
    
    # Output as JSON array of base64 data URIs
    output = json.dumps(images)
    print(output)


if __name__ == "__main__":
    main()

