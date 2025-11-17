#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simplified PDF Extraction for Past Papers
Extracts questions, images, and structure from CAPS past papers
"""

import sys
import json
import fitz  # PyMuPDF
import os
import re
import base64
from pathlib import Path
from typing import List, Dict, Any, Optional

def detect_question_type(text: str, has_options: bool) -> str:
    """Detect question type based on text patterns"""
    text_lower = text.lower()
    
    if has_options:
        return "multiple_choice"
    elif any(word in text_lower for word in ["true", "false", "waar", "onwaar"]):
        return "true_false"
    elif any(word in text_lower for word in ["match", "pasmak", "column"]):
        return "matching"
    elif any(word in text_lower for word in ["diagram", "figure", "graph", "table", "identify", "label"]):
        return "diagram"
    elif any(word in text_lower for word in ["explain", "describe", "discuss", "compare", "verduidelik"]):
        return "long_answer"
    else:
        return "short_answer"

def extract_question_number(text: str) -> Optional[str]:
    """Extract question number from text (e.g., 1.1, 1.2.1, 2.1)"""
    # Match patterns like 1.1, 1.2.1, 2.1.1, etc.
    match = re.match(r'^(\d+\.\d+(?:\.\d+)?)', text.strip())
    if match:
        return match.group(1)
    return None

def extract_marks(text: str) -> int:
    """Extract marks from text (e.g., (2), [4], 3 marks)"""
    # Look for patterns like (2), [4], 3 marks, (4 marks)
    patterns = [
        r'\((\d+)\s*marks?\)',
        r'\[(\d+)\s*marks?\]',
        r'\((\d+)\)',
        r'\[(\d+)\]',
        r'(\d+)\s*marks?',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
    
    # Default to 1 mark if not found
    return 1

def extract_mcq_options(text: str) -> Optional[List[str]]:
    """Extract multiple choice options from text"""
    # Look for A. B. C. D. or A) B) C) D) patterns
    options = []
    
    # Try different patterns
    patterns = [
        r'[A-D]\.?\s+([^\n]+)',  # A. option text or A option text
        r'[A-D]\)\s+([^\n]+)',    # A) option text
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.MULTILINE)
        if len(matches) >= 2:  # At least 2 options found
            options = [opt.strip() for opt in matches]
            break
    
    return options if options else None

def is_diagram_question(text: str, has_nearby_image: bool) -> bool:
    """Check if question involves a diagram/image"""
    text_lower = text.lower()
    diagram_keywords = [
        "diagram", "figure", "graph", "table", "chart",
        "identify", "label", "structure", "shown",
        "refer to", "study the", "look at",
        "diagramme", "figuur", "grafiek", "tabel",
        "identifiseer", "struktuur", "verwys na"
    ]
    
    return has_nearby_image or any(keyword in text_lower for keyword in diagram_keywords)

def extract_questions_from_page(page, page_num: int) -> List[Dict[str, Any]]:
    """Extract questions from a single page"""
    questions = []
    text = page.get_text()
    
    # Get text blocks with coordinates
    blocks = page.get_text("blocks")
    
    # Get images on this page
    images = page.get_images(full=True)
    
    # Find question blocks (start with number pattern like 1.1, 1.2.1, etc.)
    question_pattern = r'^\d+\.\d+(?:\.\d+)?'
    
    current_question = None
    question_text = []
    
    for block in blocks:
        if len(block) < 5:
            continue
            
        block_text = block[4].strip()
        if not block_text:
            continue
        
        # Check if this block starts a new question
        question_num = extract_question_number(block_text)
        
        if question_num:
            # Save previous question if exists
            if current_question and question_text:
                current_question['question'] = '\n'.join(question_text).strip()
                questions.append(current_question)
            
            # Start new question
            marks = extract_marks(block_text)
            options = extract_mcq_options(block_text)
            has_image = is_diagram_question(block_text, len(images) > 0)
            
            current_question = {
                'number': question_num,
                'type': detect_question_type(block_text, options is not None),
                'marks': marks,
                'options': options,
                'hasImage': has_image,
                'page': page_num,
                'question': ''
            }
            question_text = [block_text]
        elif current_question:
            # Continue current question
            question_text.append(block_text)
            
            # Check for options in continuation blocks
            if not current_question['options']:
                options = extract_mcq_options(block_text)
                if options:
                    current_question['options'] = options
                    current_question['type'] = 'multiple_choice'
    
    # Save last question
    if current_question and question_text:
        current_question['question'] = '\n'.join(question_text).strip()
        questions.append(current_question)
    
    return questions

def extract_images_from_page(doc, page, page_num: int, output_dir: str) -> List[Dict[str, Any]]:
    """Extract images from a page"""
    images = []
    image_list = page.get_images(full=True)
    
    for img_index, img in enumerate(image_list):
        try:
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            
            # Convert CMYK to RGB if needed
            if pix.n > 4:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            
            # Filter out small images (logos, icons)
            if pix.width < 100 or pix.height < 100:
                pix = None
                continue
            
            # Filter out very wide images (headers/banners)
            aspect_ratio = pix.width / pix.height if pix.height > 0 else 0
            if aspect_ratio > 5:
                pix = None
                continue
            
            # Save image
            filename = f"page{page_num}_img{img_index + 1}.png"
            filepath = os.path.join(output_dir, filename)
            pix.save(filepath)
            
            # Convert to base64
            image_bytes = pix.tobytes("png")
            base64_encoded = base64.b64encode(image_bytes).decode('utf-8')
            data_uri = f"data:image/png;base64,{base64_encoded}"
            
            # Get image position
            img_rects = page.get_image_rects(xref)
            rect = img_rects[0] if img_rects else None
            
            images.append({
                'filename': filename,
                'path': filepath,
                'dataUri': data_uri,
                'width': pix.width,
                'height': pix.height,
                'page': page_num,
                'bbox': [rect.x0, rect.y0, rect.x1, rect.y1] if rect else None
            })
            
            pix = None
            
        except Exception as e:
            print(f"Warning: Could not extract image {img_index} from page {page_num}: {e}", file=sys.stderr)
            continue
    
    return images

def associate_images_with_questions(questions: List[Dict], images: List[Dict]) -> None:
    """Associate images with questions based on page and position"""
    for question in questions:
        if question['hasImage']:
            # Find images on the same page
            page_images = [img for img in images if img['page'] == question['page']]
            
            if page_images:
                # For now, associate the first image on the page
                # In a more sophisticated version, we'd use bbox proximity
                question['image'] = page_images[0]['dataUri']
                question['imageFilename'] = page_images[0]['filename']

def extract_paper(pdf_path: str, output_dir: str) -> Dict[str, Any]:
    """Extract complete paper with questions and images"""
    doc = fitz.open(pdf_path)
    
    # Create output directory for images
    images_dir = os.path.join(output_dir, 'images')
    os.makedirs(images_dir, exist_ok=True)
    
    # Parse metadata from filename
    filename = os.path.basename(pdf_path)
    metadata = parse_metadata(filename)
    
    all_questions = []
    all_images = []
    
    print(f"Processing {len(doc)} pages...", file=sys.stderr)
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Extract questions from this page
        page_questions = extract_questions_from_page(page, page_num + 1)
        all_questions.extend(page_questions)
        
        # Extract images from this page
        page_images = extract_images_from_page(doc, page, page_num + 1, images_dir)
        all_images.extend(page_images)
        
        print(f"  Page {page_num + 1}: {len(page_questions)} questions, {len(page_images)} images", file=sys.stderr)
    
    doc.close()
    
    # Associate images with questions
    associate_images_with_questions(all_questions, all_images)
    
    print(f"\nExtracted {len(all_questions)} questions and {len(all_images)} images", file=sys.stderr)
    
    return {
        'filename': filename,
        'metadata': metadata,
        'questions': all_questions,
        'images': all_images,
        'totalPages': len(doc),
        'totalQuestions': len(all_questions),
        'totalImages': len(all_images)
    }

def parse_metadata(filename: str) -> Dict[str, Any]:
    """Parse metadata from filename"""
    name = os.path.splitext(filename)[0]
    name = re.sub(r'\s*\(\d+\)\s*$', '', name)
    
    # Extract year
    year_match = re.search(r'(\d{4})', name)
    year = int(year_match.group(1)) if year_match else 2020
    
    # Extract paper number
    paper_match = re.search(r'P(\d+)', name, re.IGNORECASE)
    paper = f"Paper {paper_match.group(1)}" if paper_match else "Paper 1"
    
    # Extract subject (remove common words)
    subject = re.sub(r"P\d+.*", "", name).strip()
    subject = re.sub(r"\b(Nov|Memo|Afr|Eng|NSC|IEB)\b", "", subject, flags=re.IGNORECASE).strip()
    subject = re.sub(r"\s+", " ", subject).strip()
    
    # Detect if memo
    is_memo = bool(re.search(r'\bmemo\b', name, re.IGNORECASE))
    
    return {
        'subject': subject or 'Life Sciences',
        'grade': 12,
        'paper': paper,
        'year': year,
        'isMemo': is_memo
    }

def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_paper_simple.py <pdf_path> [output_dir]", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else './extracted'
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract paper
    result = extract_paper(pdf_path, output_dir)
    
    # Save JSON
    json_path = os.path.join(output_dir, 'extracted.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Extraction complete!", file=sys.stderr)
    print(f"✓ JSON saved to: {json_path}", file=sys.stderr)
    print(f"✓ Images saved to: {os.path.join(output_dir, 'images')}", file=sys.stderr)
    
    # Also print JSON to stdout for piping
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
