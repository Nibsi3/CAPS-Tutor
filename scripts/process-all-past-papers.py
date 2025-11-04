#!/usr/bin/env python3
"""Process ALL past papers to add images, markers, and ensure proper diagram sharing"""
import re
import os
import glob
import base64
import json
from PIL import Image, ImageDraw, ImageFont
import io

def add_modern_marker(img, position, label):
    """Add a modern styled marker (X, Y, Z, etc.) to an image"""
    draw = ImageDraw.Draw(img)
    x, y = position
    shadow_size = 75
    draw.ellipse([x - shadow_size//2 + 2, y - shadow_size//2 + 2, x + shadow_size//2 + 2, y + shadow_size//2 + 2],
                 fill=(80, 80, 80, 180), outline=(60, 60, 60), width=2)
    circle_size = 75
    draw.ellipse([x - circle_size//2, y - circle_size//2, x + circle_size//2, y + circle_size//2],
                 fill='white', outline='#2563eb', width=4)
    draw.ellipse([x - (circle_size-10)//2, y - (circle_size-10)//2, x + (circle_size-10)//2, y + (circle_size-10)//2],
                 outline='#bfdbfe', width=2)
    try:
        font = ImageFont.truetype("arial.ttf", 48)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        except:
            font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), label, font=font)
    text_x = x - (bbox[2] - bbox[0]) // 2
    text_y = y - (bbox[3] - bbox[1]) // 2 - 8
    draw.text((text_x + 2, text_y + 2), label, fill='#1e40af', font=font)
    draw.text((text_x, text_y), label, fill='#2563eb', font=font)

def convert_image_to_jpeg_base64(image_path, marker_positions=None):
    """Convert any image format to JPEG base64, optionally adding markers"""
    try:
        img = Image.open(image_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        width, height = img.size
        
        # Add markers if provided
        if marker_positions:
            for pos, label in marker_positions:
                if pos and label:
                    # If position is None, use default position based on label
                    if pos is None:
                        # Default positions: X on left, Y on right, Z on top, etc.
                        positions = {
                            'X': (width // 4, height // 2),
                            'Y': (3 * width // 4, height // 2),
                            'Z': (width // 2, height // 4),
                            'W': (width // 2, 3 * height // 4),
                        }
                        pos = positions.get(label, (width // 2, height // 2))
                    add_modern_marker(img, pos, label)
        
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG', quality=95)
        img_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return f'data:image/jpeg;base64,{img_b64}'
    except Exception as e:
        print(f"  Error converting {image_path}: {e}")
        return None

def extract_all_questions():
    """Extract all questions from past-paper-questions.ts"""
    with open('src/lib/past-paper-questions.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match question entries
    pattern = r"id: '([^']+)',\s*questionNumber: '([^']+)',\s*marks: (\d+),\s*paperYear: (\d+),\s*paperNumber: '([^']+)',\s*topic: '([^']+)',\s*question: '((?:[^'\\]|\\.)+?)',\s*answer: '((?:[^'\\]|\\.)+?)',\s*type: '[^']+'(?:,\s*imageUrl: '([^']*)')?"
    
    matches = re.findall(pattern, content, re.DOTALL)
    
    questions = []
    for match in matches:
        qid = match[0]
        qnum = match[1]
        marks = int(match[2])
        year = int(match[3])
        paper_num = match[4]
        topic = match[5]
        question_text = match[6]
        answer = match[7]
        image_url = match[8] if len(match) > 8 and match[8] else None
        
        # Extract subject from qid (e.g., 'bio-p1-2020-1.1' -> 'bio', 'p1', '2020')
        parts = qid.split('-')
        if len(parts) >= 3:
            subject_code = parts[0]
            paper_code = parts[1]
            
            # Check if question needs an image
            needs_image = any(keyword in question_text.lower() for keyword in [
                'diagram', 'figure', 'shown', 'below', 'above', 'identify', 'label',
                'structure', 'mark', 'marked', 'indicated', 'picture', 'image', 'graph',
                'chart', 'drawing'
            ])
            
            # Extract marker labels (X, Y, Z, etc.)
            marker_match = re.search(r'(?:identify|mark|marked|indicated|label)\s+(?:structure\s+)?([A-Z])', question_text, re.IGNORECASE)
            marker = marker_match.group(1).upper() if marker_match else None
            
            # Check if existing image URL is PPM/PGM (needs conversion)
            needs_conversion = image_url and ('ppm' in image_url.lower() or 'pgm' in image_url.lower() or 
                                              image_url.startswith('data:image/x-portable'))
            
            questions.append({
                'qid': qid,
                'qnum': qnum,
                'subject_code': subject_code,
                'paper_code': paper_code,
                'year': year,
                'paper_num': paper_num,
                'topic': topic,
                'question': question_text,
                'answer': answer,
                'marks': marks,
                'needs_image': needs_image,
                'has_image': bool(image_url),
                'image_url': image_url,
                'needs_conversion': needs_conversion,
                'marker': marker
            })
    
    return questions

def find_image_files(subject_code, paper_code, year):
    """Find image files for a paper - images are in base directory as files"""
    subject_map = {
        'bio': 'Life Sciences',
        'math': 'Mathematics',
        'physics': 'Physical Sciences',
        'accounting': 'Accounting',
        'business': 'Business Studies',
        'geo': 'Geography',
        'dance': 'Dance Studies',
        'visual': 'Visual Arts',
        'eng': 'English',
        'afr': 'Afrikaans',
        'agri': 'Agricultural',
        'ag-mgmt': 'Agricultural Management',
        'ag-tech': 'Agricultural Technology',
        'cat': 'Computer Applications Technology',
        'it': 'Information Technology',
        'civil': 'Civil Technology',
        'consumer': 'Consumer Studies',
        'design': 'Design',
        'drama': 'Dramatic Arts',
        'econ': 'Economics',
        'egd': 'Engineering Graphics',
        'electrical': 'Electrical Technology',
        'hist': 'History',
        'hospitality': 'Hospitality Studies',
        'mathlit': 'Mathematical Literacy',
        'mechanical': 'Mechanical Technology',
        'music': 'Music',
        'tech-sci': 'Technical Sciences',
        'tourism': 'Tourism',
    }
    
    subject_name = subject_map.get(subject_code, subject_code)
    paper_name = f"P{paper_code[1:]}" if paper_code.startswith('p') else paper_code
    
    base_dir = 'Past Paper Images'
    if not os.path.exists(base_dir):
        return []
    
    # Find files matching the pattern
    all_files = [f for f in os.listdir(base_dir) if os.path.isfile(os.path.join(base_dir, f))]
    
    # Match patterns
    matching_files = []
    year_str = str(year)
    
    for filename in all_files:
        filename_lower = filename.lower()
        # Check if file matches subject, paper, and year
        if (subject_name.lower() in filename_lower or subject_code.lower() in filename_lower) and \
           (paper_name.lower() in filename_lower or paper_code.lower() in filename_lower) and \
           year_str in filename:
            # Only PNG/JPEG files
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                matching_files.append(os.path.join(base_dir, filename))
    
    # Sort files for consistent ordering
    matching_files.sort()
    return matching_files

def group_questions_by_main_number(questions):
    """Group questions by main question number (e.g., 1.1, 1.2, 1.3 -> group 1)"""
    groups = {}
    for q in questions:
        main_q = q['qnum'].split('.')[0]
        if main_q not in groups:
            groups[main_q] = []
        groups[main_q].append(q)
    return groups

def main():
    print("=" * 80)
    print("Processing ALL Past Papers for Images")
    print("=" * 80)
    
    file_path = 'src/lib/past-paper-questions.ts'
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found")
        return
    
    # Extract all questions
    print("\nExtracting all questions...")
    questions = extract_all_questions()
    print(f"Found {len(questions)} total questions")
    
    # Group by paper
    papers = {}
    for q in questions:
        paper_key = f"{q['subject_code']}-{q['paper_code']}-{q['year']}"
        if paper_key not in papers:
            papers[paper_key] = []
        papers[paper_key].append(q)
    
    # Sort questions within each paper
    for paper_key in papers:
        papers[paper_key].sort(key=lambda x: [int(p) if p.isdigit() else 0 for p in x['qnum'].split('.')])
    
    print(f"Found {len(papers)} unique papers\n")
    
    # Process each paper
    conversions = {}  # Map of qid -> base64 image data
    missing_images = []  # Papers/questions that need images but don't have them
    
    for paper_key in sorted(papers.keys()):
        paper_questions = papers[paper_key]
        parts = paper_key.split('-')
        subject_code = parts[0]
        paper_code = parts[1]
        year = parts[2]
        
        print(f"Processing {paper_key}: {len(paper_questions)} questions")
        
        # Find image files (they're in the base directory as files, not subdirectories)
        img_files = find_image_files(subject_code, paper_code, year)
        
        if img_files:
            print(f"  Found {len(img_files)} image files")
            
            # Group questions by main question number
            question_groups = group_questions_by_main_number(paper_questions)
            
            # Process each group
            img_idx = 0
            for main_q in sorted(question_groups.keys(), key=lambda x: int(x) if x.isdigit() else 0):
                group = question_groups[main_q]
                questions_needing_images = [q for q in group if q['needs_image']]
                
                if questions_needing_images and img_idx < len(img_files):
                    first_q = questions_needing_images[0]
                    
                    # Collect markers from all questions in group
                    marker_positions = []
                    for q in questions_needing_images:
                        if q['marker']:
                            marker_positions.append((None, q['marker']))  # Position will be auto-assigned
                    
                    # Convert image
                    img_data = convert_image_to_jpeg_base64(img_files[img_idx], 
                                                           marker_positions=marker_positions if marker_positions else None)
                    
                    if img_data:
                        # Assign to first question
                        conversions[first_q['qid']] = img_data
                        
                        # Share with follow-up questions in same group
                        for follow_q in questions_needing_images[1:]:
                            conversions[follow_q['qid']] = img_data
                        
                        markers_str = ', '.join([m[1] for m in marker_positions]) if marker_positions else 'no markers'
                        print(f"    Group {main_q}: Added image to {len(questions_needing_images)} questions ({markers_str})")
                        img_idx += 1
                elif questions_needing_images:
                    # Questions need images but no more images available
                    missing_images.append({
                        'paper': paper_key,
                        'group': main_q,
                        'questions': [q['qid'] for q in questions_needing_images]
                    })
        else:
            # No image directory found - check if any questions need images
            questions_needing_images = [q for q in paper_questions if q['needs_image']]
            if questions_needing_images:
                missing_images.append({
                    'paper': paper_key,
                    'group': 'all',
                    'questions': [q['qid'] for q in questions_needing_images]
                })
                print(f"  No image directory found - {len(questions_needing_images)} questions need images")
        
        print()
    
    # Save conversions
    output_file = 'scripts/all-papers-image-conversions.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(conversions, f, indent=2)
    
    print(f"[OK] Saved {len(conversions)} image conversions to {output_file}")
    
    if missing_images:
        missing_file = 'scripts/missing-images-report.json'
        with open(missing_file, 'w', encoding='utf-8') as f:
            json.dump(missing_images, f, indent=2)
        print(f"[WARNING] {len(missing_images)} groups need images but don't have them (saved to {missing_file})")
    
    print("\nNext step: Run Node.js script to update past-paper-questions.ts")

if __name__ == '__main__':
    main()
