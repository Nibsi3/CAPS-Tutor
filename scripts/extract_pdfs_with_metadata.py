"""
Action 1: Extract PDFs & Parse Metadata
Extracts text and images from PDFs and automatically parses metadata from filenames.
"""

import fitz  # PyMuPDF
import json
import os
import re
import base64

# Folder where all PDFs are stored
PDF_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "past papers")
OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "extracted_papers")


def parse_metadata(filename):
    """
    Example filename: 'Life Sciences P1 Nov 2020 Eng (2).pdf'
    Extracts:
    - subject: Life Sciences
    - grade: 12 (we can define a mapping if needed)
    - paper: Paper 1
    - year: 2020
    """
    name = os.path.splitext(filename)[0]
    
    # Remove common suffixes like "(2)", "(1)", etc.
    name = re.sub(r'\s*\(\d+\)\s*$', '', name)
    
    # Regex for paper and year
    paper_match = re.search(r"P(\d+)", name, re.IGNORECASE)
    year_match = re.search(r"(\d{4})", name)
    
    paper = f"Paper {paper_match.group(1)}" if paper_match else "Paper 1"
    year = int(year_match.group(1)) if year_match else 2020
    
    # Subject = everything before P1 or year, remove common words like "Nov", "Memo", "Afr", "Eng"
    # Remove paper number, year, and common suffixes
    subject = re.sub(r"P\d+.*", "", name).strip()
    subject = re.sub(r"\b(Nov|Memo|Afr|Eng|Eastern Cape|Free State|KwaZulu-Natal|Limpopo|Mpumalanga|North West|Northern Cape|Western Cape)\b", "", subject, flags=re.IGNORECASE).strip()
    subject = re.sub(r"\s+", " ", subject).strip()
    
    # Grade mapping (all Grade 12 for now, can be adjusted)
    grade = 12
    
    return subject, grade, paper, year


def extract_pdf(path):
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
    
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text()
        
        # Get text blocks with coordinates for finding image labels
        text_blocks = page.get_text("blocks")
        images = []
        
        # Extract images with coordinates and labels
        for img_index, img in enumerate(page.get_images(full=True), start=1):
            try:
                xref = img[0]
                
                # Get image rectangle coordinates from image insertions
                img_rects = page.get_image_rects(xref)
                if not img_rects:
                    continue
                
                img_rect = img_rects[0]  # Use first rectangle
                
                pix = fitz.Pixmap(doc, xref)
                
                # Convert to RGB if necessary
                if pix.n - pix.alpha >= 4:  # CMYK: convert to RGB first
                    pix1 = fitz.Pixmap(fitz.csRGB, pix)
                    pix = pix1
                    pix1 = None
                
                # Filter criteria: exclude logos, department images, and black bars
                width = pix.width
                height = pix.height
                aspect_ratio = width / height if height > 0 else 0
                
                # Skip very small images (likely icons/logos) - increased threshold
                if width < 150 or height < 150:
                    print(f"  Skipping small image ({width}x{height}) on page {page_num} - likely logo/icon")
                    pix = None
                    continue
                
                # Skip very wide images (likely headers/banners with Department of Education logos)
                if aspect_ratio > 4:
                    print(f"  Skipping wide banner image ({width}x{height}) on page {page_num} - likely header/logo")
                    pix = None
                    continue
                
                # Skip very tall thin images (likely sidebars)
                if aspect_ratio < 0.25:
                    print(f"  Skipping tall thin image ({width}x{height}) on page {page_num} - likely sidebar")
                    pix = None
                    continue
                
                # Check if image is mostly black (broken/placeholder/black bars)
                # Sample pixels from multiple areas
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
                        # Check if pixel is very dark (RGB all < 40 for black bars)
                        r = (pixel >> 16) & 0xFF
                        g = (pixel >> 8) & 0xFF
                        b = pixel & 0xFF
                        if r < 40 and g < 40 and b < 40:
                            black_pixels += 1
                    except:
                        pass
                
                # Skip if more than 75% of sampled pixels are black (black bars/placeholders)
                if total_samples > 0 and (black_pixels / total_samples) > 0.75:
                    print(f"  Skipping mostly black image ({width}x{height}) on page {page_num} - likely black bar/placeholder")
                    pix = None
                    continue
                
                # Save image file
                img_path = os.path.join(img_dir, f"page_{page_num}_img_{img_index}.png")
                pix.save(img_path)
                
                # Convert to base64 data URI for Firestore
                image_bytes = pix.tobytes("png")
                base64_encoded = base64.b64encode(image_bytes).decode('utf-8')
                data_uri = f"data:image/png;base64,{base64_encoded}"
                
                # Find nearest text block above or beside the image for label
                label_text = ""
                for block in text_blocks:
                    if len(block) >= 5:
                        bx0, by0, bx1, by1 = block[0], block[1], block[2], block[3]
                        block_text = block[4] if len(block) > 4 else ""
                        block_rect = fitz.Rect(bx0, by0, bx1, by1)
                        
                        # If block is above or intersects horizontally with image (within tolerance)
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
                                # Also capture short text that might be a label
                                elif len(block_text_clean) < 100:
                                    label_text += block_text_clean + " "
                
                # If no label found, try looking for text immediately above
                if not label_text:
                    for block in text_blocks:
                        if len(block) >= 5:
                            bx0, by0, bx1, by1 = block[0], block[1], block[2], block[3]
                            block_text = block[4] if len(block) > 4 else ""
                            block_rect = fitz.Rect(bx0, by0, bx1, by1)
                            
                            # Text directly above image
                            if (block_rect.y1 <= img_rect.y0 + 5 and
                                abs(block_rect.x0 - img_rect.x0) < 50):
                                block_text_clean = block_text.strip()
                                if block_text_clean and len(block_text_clean) < 150:
                                    label_text = block_text_clean
                                    break
                
                images.append({
                    "path": f"images/page_{page_num}_img_{img_index}.png",
                    "dataUri": data_uri,
                    "width": width,
                    "height": height,
                    "rect": [img_rect.x0, img_rect.y0, img_rect.x1, img_rect.y1],
                    "label": label_text.strip() if label_text else None
                })
                
                pix = None
            except Exception as e:
                print(f"Warning: Could not extract image {img_index} from page {page_num}: {e}")
                continue
        
        output["pages"].append({
            "page": page_num,
            "text": text,
            "images": images
        })
    
    doc.close()
    
    # Save JSON output
    json_path = os.path.join(output_dir, f"{base}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    return json_path, img_dir


def main():
    """Main function to process PDFs."""
    # Create output folder
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    
    # Filter for Life Sciences P1 only (for testing)
    # Remove the filter to process all PDFs
    filter_subject = "Life Sciences"
    filter_paper = "P1"
    
    all_pdfs = []
    
    if not os.path.exists(PDF_FOLDER):
        print(f"Error: PDF folder not found: {PDF_FOLDER}")
        return []
    
    for pdf_file in os.listdir(PDF_FOLDER):
        if not pdf_file.endswith(".pdf"):
            continue
        
        # Skip memos for now (we'll process them separately if needed)
        if "Memo" in pdf_file:
            continue
        
        # Filter for testing
        if filter_subject and filter_subject.lower() not in pdf_file.lower():
            continue
        if filter_paper and filter_paper.upper() not in pdf_file.upper():
            continue
        
        pdf_path = os.path.join(PDF_FOLDER, pdf_file)
        print(f"Processing: {pdf_file}")
        
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
            
            print(f"  [OK] Extracted: {subject} {paper} {year}")
        except Exception as e:
            print(f"  [ERROR] Error processing {pdf_file}: {e}")
            continue
    
    # Save metadata summary
    summary_path = os.path.join(OUTPUT_FOLDER, "extraction_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(all_pdfs, f, indent=2, ensure_ascii=False)
    
    print(f"\n[SUCCESS] Processed {len(all_pdfs)} PDF(s)")
    print(f"[SUCCESS] Summary saved to: {summary_path}")
    
    return all_pdfs


if __name__ == "__main__":
    result = main()
    print(f"\nAll PDFs array:")
    print(json.dumps(result, indent=2))




