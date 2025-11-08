#!/usr/bin/env python3
"""
Extract text and images from PDF using OCR
Reads PDF data URI from stdin (JSON format) and outputs extracted data as JSON
"""

import sys
import json
import re
import base64

try:
    import fitz  # PyMuPDF
except ImportError:
    print("ERROR: PyMuPDF not installed. Install it with: pip install pymupdf", file=sys.stderr)
    sys.exit(1)


def parse_metadata(filename):
    """
    Parse metadata from filename
    Example: 'Life Sciences P1 Nov 2020 Eng (2).pdf'
    """
    name = filename.replace('.pdf', '').strip()
    
    # Remove common suffixes like "(2)", "(1)", etc.
    name = re.sub(r'\s*\(\d+\)\s*$', '', name)
    
    # Extract paper number
    paper_match = re.search(r"P\s*(\d+)|Paper\s*(\d+)", name, re.IGNORECASE)
    paper = f"Paper {paper_match.group(1) if paper_match and paper_match.group(1) else (paper_match.group(2) if paper_match and paper_match.group(2) else '1')}"
    
    # Extract year
    year_match = re.search(r"(\d{4})", name)
    year = int(year_match.group(1)) if year_match else 2020
    
    # Extract subject
    subject = 'Life Sciences'
    if re.search(r"life\s*science", name, re.IGNORECASE):
        subject = 'Life Sciences'
    
    # Default grade
    grade = 12
    
    return subject, grade, paper, year


def extract_pdf_from_data_uri(pdf_data_uri, filename):
    """Extract text and images from PDF data URI."""
    # Extract base64 data from data URI
    if pdf_data_uri.startswith('data:'):
        base64_data = pdf_data_uri.split(',')[1]
    else:
        base64_data = pdf_data_uri
    
    # Decode base64 to PDF bytes
    pdf_bytes = base64.b64decode(base64_data)
    
    # Open PDF from memory
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    # Parse metadata
    subject, grade, paper, year = parse_metadata(filename)
    
    # Initialize output
    output = {
        "filename": filename,
        "subject": subject,
        "grade": grade,
        "paper": paper,
        "year": year,
        "pages": []
    }
    
    # Extract from each page
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text()
        
        # Get text blocks with coordinates
        text_blocks = page.get_text("blocks")
        images = []
        
        # Extract images
        for img_index, img in enumerate(page.get_images(full=True), start=1):
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
                
                # Skip very small images (likely icons/logos)
                if pix.width < 50 or pix.height < 50:
                    pix = None
                    continue
                
                # Check if image is mostly black (black bars/placeholders)
                sample_points = []
                for sy in range(0, min(10, pix.height), max(1, pix.height // 10)):
                    for sx in range(0, min(10, pix.width), max(1, pix.width // 10)):
                        if sx < pix.width and sy < pix.height:
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
                
                # Skip if mostly black
                if total_samples > 0 and (black_pixels / total_samples) > 0.75:
                    pix = None
                    continue
                
                # Convert to base64 data URI
                image_bytes = pix.tobytes("png")
                base64_encoded = base64.b64encode(image_bytes).decode('utf-8')
                data_uri = f"data:image/png;base64,{base64_encoded}"
                
                # Find nearest text block for label
                label_text = ""
                min_distance = float('inf')
                for block in text_blocks:
                    if len(block) < 5:
                        continue
                    block_rect = fitz.Rect(block[:4])
                    distance = abs((block_rect.y0 + block_rect.y1) / 2 - (img_rect.y0 + img_rect.y1) / 2)
                    if distance < min_distance and distance < 50:  # Within 50 points
                        min_distance = distance
                        label_text = block[4].strip() if len(block) > 4 else ""
                
                images.append({
                    "imageIndex": img_index,
                    "dataUri": data_uri,
                    "pageNumber": page_num,
                    "coordinates": {
                        "x0": img_rect.x0,
                        "y0": img_rect.y0,
                        "x1": img_rect.x1,
                        "y1": img_rect.y1
                    },
                    "label": label_text[:100] if label_text else None
                })
                
                pix = None
                
            except Exception as e:
                # Skip images that can't be extracted
                continue
        
        output["pages"].append({
            "pageNumber": page_num,
            "text": text,
            "images": images
        })
    
    doc.close()
    return output


def main():
    # Read JSON input from stdin
    input_data = sys.stdin.read().strip()
    
    try:
        data = json.loads(input_data)
        pdf_data_uri = data.get('pdfDataUri', '')
        filename = data.get('filename', 'unknown.pdf')
        
        if not pdf_data_uri:
            print("ERROR: pdfDataUri is required", file=sys.stderr)
            sys.exit(1)
        
        # Extract PDF
        result = extract_pdf_from_data_uri(pdf_data_uri, filename)
        
        # Output as JSON
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()

