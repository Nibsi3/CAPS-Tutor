"""
Extract questions from PDF - optimized version for Node.js integration
Returns JSON that can be streamed question by question
"""
import json
import re
import os
import base64
import sys
from pathlib import Path
from datetime import datetime
from io import BytesIO

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False
    print("ERROR: PyMuPDF is required. Install with: pip install PyMuPDF", file=sys.stderr)
    sys.exit(1)

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

# Import image extraction functions
try:
    from add_images_to_json import (
        extract_images_pymupdf,
        extract_diagram_regions_from_page
    )
except ImportError:
    print("ERROR: add_images_to_json.py not found. Make sure it's in the same directory.", file=sys.stderr)
    sys.exit(1)


def extract_questions_from_pdf(pdf_path):
    """Extract questions from PDF in order"""
    doc = fitz.open(pdf_path)
    questions = []
    
    question_patterns = [
        (r'Question\s+(\d+)', 1),
        (r'^\s*(\d+)[\.\)]\s+', 1),
        (r'^\s*\((\d+)\)\s+', 1),
        (r'Q\s*(\d+)', 1),
        (r'QUESTION\s+(\d+)', 1),
        (r'^(\d+)\s+[A-Z]', 1),
    ]
    
    seen_question_nums = set()
    question_starts = []
    
    # First pass: identify all question starts
    for page_num in range(len(doc)):
        page = doc[page_num]
        text_dict = page.get_text("dict")
        
        blocks_data = []
        for block in text_dict.get("blocks", []):
            if "lines" not in block:
                continue
            
            block_text = ""
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    block_text += span.get("text", "") + " "
            
            block_text = block_text.strip()
            if not block_text:
                continue
            
            blocks_data.append({
                "text": block_text,
                "bbox": block.get("bbox", [])
            })
        
        # Find all question starts on this page
        for block_idx, block_data in enumerate(blocks_data):
            block_text = block_data["text"]
            
            for pattern, group_num in question_patterns:
                match = re.match(pattern, block_text, re.IGNORECASE)
                if match:
                    question_num = int(match.group(group_num))
                    if question_num not in seen_question_nums:
                        question_starts.append((question_num, block_idx, page_num, blocks_data))
                        seen_question_nums.add(question_num)
                    break
    
    # Sort by question number
    question_starts.sort(key=lambda x: x[0])
    
    # Second pass: extract full question text
    for i, (question_num, block_idx, page_num, blocks_data) in enumerate(question_starts):
        question_text = blocks_data[block_idx]["text"]
        
        # Find next question start to know where to stop
        if i < len(question_starts) - 1:
            next_question_num, next_block_idx, next_page_num, _ = question_starts[i + 1]
            if next_page_num == page_num:
                for j in range(block_idx + 1, next_block_idx):
                    if j < len(blocks_data):
                        question_text += " " + blocks_data[j]["text"]
            else:
                for j in range(block_idx + 1, len(blocks_data)):
                    question_text += " " + blocks_data[j]["text"]
        else:
            for j in range(block_idx + 1, len(blocks_data)):
                question_text += " " + blocks_data[j]["text"]
        
        questions.append({
            "question_number": question_num,
            "question_text": question_text.strip(),
            "page_number": page_num + 1,
            "bbox": blocks_data[block_idx].get("bbox", []),
            "full_text": question_text.strip()
        })
    
    doc.close()
    return questions


def classify_question_type(question_text):
    """Classify question type based on content"""
    text_lower = question_text.lower()
    
    # Check for image cues
    image_cues = [
        r'the\s+diagrams?\s+below\s+show',
        r'the\s+diagram\s+shows',
        r'refer\s+to\s+the\s+diagram',
        r'look\s+at\s+the\s+diagram',
    ]
    if any(re.search(pattern, text_lower) for pattern in image_cues):
        return 'diagram'
    
    # Check for multiple choice
    if re.search(r'[\(\)]\s*[A-D]\s*[\)\)]', text_lower) or \
       re.search(r'option\s+[A-D]', text_lower):
        return 'multiple-choice'
    
    # Check for table
    if 'table' in text_lower or 'column' in text_lower:
        return 'table'
    
    # Check for graph
    if 'graph' in text_lower or 'chart' in text_lower:
        return 'graph'
    
    return 'normal'


def match_images_to_question(question, all_images, all_diagram_regions, question_index, all_questions, total_pages, pdf_path, page_images=None):
    """Match images/diagrams to a question - ONLY use exact page screenshots, NO extracted regions"""
    matched_images = []
    question_page = question['page_number']
    
    # Search same page and next 2 pages
    search_pages = list(range(question_page, min(question_page + 3, total_pages + 1)))
    
    # ONLY use page_images (exact page screenshots) - NO extracted regions
    # User explicitly wants exact screenshots, not extracted diagram regions
    if page_images:
        for page_img in page_images:
            if page_img.get('page_number') in search_pages:
                matched_images.append({
                    'type': 'diagram',
                    'image_data': page_img.get('image_data', ''),
                    'page_number': page_img.get('page_number'),
                    'format': page_img.get('format', 'png'),
                    'extraction_method': 'page_screenshot',  # Exact screenshot only
                })
                print(f"Matched page screenshot (page {page_img.get('page_number')}) to question {question.get('question_number')}", file=sys.stderr)
    
    # DO NOT use diagram_regions or extracted regions - user wants ONLY screenshots
    # If no screenshot found, return empty (don't fall back to extracted regions)
    
    return matched_images


def extract_complete_page_diagrams(pdf_path, question_page, search_pages):
    """Extract complete diagrams from pages"""
    doc = fitz.open(pdf_path)
    complete_diagrams = []
    
    for page_num in search_pages:
        if page_num < 1 or page_num > len(doc):
            continue
        
        page = doc[page_num - 1]
        image_list = page.get_images(full=True)
        image_rects = []
        for img in image_list:
            try:
                xref = img[0]
                image_instances = page.get_image_rects(xref)
                if image_instances:
                    image_rects.extend(image_instances)
            except:
                pass
        
        if image_rects:
            regions = extract_diagram_regions_from_page(page, page_num - 1, embedded_image_rects=image_rects, dpi=300)
            for region in regions:
                complete_diagrams.append({
                    'type': 'diagram',
                    'image_data': region.get('image_data', ''),
                    'page_number': page_num,
                    'format': region.get('format', 'png'),
                })
    
    doc.close()
    return complete_diagrams


def extract_questions_with_images_streaming(pdf_path):
    """
    Extract questions and yield them one by one for streaming
    Uses exact page screenshots for diagrams (not extracted regions)
    """
    # Step 1: Extract questions
    questions = extract_questions_from_pdf(pdf_path)
    
    # Step 2: Extract images and diagram regions
    embedded_images, page_images, diagram_regions = extract_images_pymupdf(pdf_path)
    
    print(f"Extracted {len(diagram_regions)} diagram regions", file=sys.stderr)
    print(f"Extracted {len(embedded_images)} embedded images", file=sys.stderr)
    print(f"Extracted {len(page_images)} page images (screenshots - will be used for questions)", file=sys.stderr)
    
    # Get total pages
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    doc.close()
    
    # Step 3: Process each question and yield it
    for i, question in enumerate(questions):
        # Classify question type
        question['question_type'] = classify_question_type(question['question_text'])
        
        # Match images - PRIORITIZE page_images (exact screenshots) over diagram_regions
        question['images'] = match_images_to_question(
            question, embedded_images, diagram_regions, i, questions, total_pages, pdf_path, page_images=page_images
        )
        
        # Yield question as JSON
        yield json.dumps({
            "type": "question",
            "data": question
        }) + "\n"
    
    # Yield completion
    yield json.dumps({
        "type": "complete",
        "total": len(questions)
    }) + "\n"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_questions.py <pdf_path>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Stream questions
    for line in extract_questions_with_images_streaming(pdf_path):
        print(line, end='', flush=True)

