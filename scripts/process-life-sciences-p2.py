"""
Process Life Sciences P2 Nov 2020:
1. Find questions that need images
2. Match with PPM images from Past Paper Images folder
3. Add images and X/Y markers where needed
4. Ensure follow-up questions share images
"""
import re
import os
import glob
import base64
from PIL import Image, ImageDraw, ImageFont
import io

def add_modern_marker(img, position, label):
    """Add a modern marker (X, Y, etc.) to an image."""
    draw = ImageDraw.Draw(img)
    x, y = position
    
    shadow_size = 75
    draw.ellipse(
        [x - shadow_size//2 + 2, y - shadow_size//2 + 2,
         x + shadow_size//2 + 2, y + shadow_size//2 + 2],
        fill=(80, 80, 80, 180),
        outline=(60, 60, 60),
        width=2
    )
    
    circle_size = 75
    draw.ellipse(
        [x - circle_size//2, y - circle_size//2,
         x + circle_size//2, y + circle_size//2],
        fill='white',
        outline='#2563eb',
        width=4
    )
    
    draw.ellipse(
        [x - (circle_size-10)//2, y - (circle_size-10)//2,
         x + (circle_size-10)//2, y + (circle_size-10)//2],
        outline='#bfdbfe',
        width=2
    )
    
    try:
        font = ImageFont.truetype("arial.ttf", 48)
    except:
        try:
            font = ImageFont.truetype("arialbd.ttf", 48)
        except:
            font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), label, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = x - text_width // 2
    text_y = y - text_height // 2 - 8
    
    draw.text((text_x + 2, text_y + 2), label, fill='#1e40af', font=font)
    draw.text((text_x, text_y), label, fill='#2563eb', font=font)

def convert_ppm_to_jpeg_base64(ppm_path, marker_position=None, marker_label=None):
    """Convert PPM to JPEG base64, optionally adding a marker."""
    img = Image.open(ppm_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    if marker_position and marker_label:
        add_modern_marker(img, marker_position, marker_label)
    
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=95)
    img_bytes = buffer.getvalue()
    img_b64 = base64.b64encode(img_bytes).decode('utf-8')
    return f'data:image/jpeg;base64,{img_b64}'

# Load content
print("=" * 80)
print("Processing Life Sciences P2 Nov 2020")
print("=" * 80)

with open('src/lib/past-paper-questions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all Life Sciences P2 questions
print("\nFinding Life Sciences P2 questions...")
p2_pattern = r"id: 'bio-p2-2020-([^']+)'[^}]*?questionNumber: '([^']+)'[^}]*?question: '([^']+)'[^}]*?(?:imageUrl: '([^']*)')?"
matches = list(re.finditer(p2_pattern, content, re.DOTALL))

print(f"Found {len(matches)} Life Sciences P2 questions")

# Organize questions by question number
questions = {}
for match in matches:
    qnum = match.group(2)  # e.g., "1.1", "2.3"
    qid = f"bio-p2-2020-{match.group(1)}"
    question_text = match.group(3)
    current_image = match.group(4) if match.group(4) else None
    
    # Check if question needs image/marker
    needs_image = False
    needs_marker = False
    marker_label = None
    
    question_lower = question_text.lower()
    if any(word in question_lower for word in ['diagram', 'figure', 'picture', 'image', 'illustration', 'drawing', 'below', 'shown']):
        needs_image = True
    
    # Check if asking to identify X/Y/Z
    marker_match = re.search(r'identify\s+(structure\s+)?([A-Z])', question_text, re.IGNORECASE)
    if marker_match:
        needs_image = True
        needs_marker = True
        marker_label = marker_match.group(2).upper()
    
    questions[qnum] = {
        'qid': qid,
        'question': question_text,
        'current_image': current_image,
        'needs_image': needs_image,
        'needs_marker': needs_marker,
        'marker_label': marker_label,
        'match': match
    }

print(f"\nQuestions that need images: {sum(1 for q in questions.values() if q['needs_image'])}")

# Find PPM images for Life Sciences P2
print("\nFinding PPM images...")
ls_p2_dirs = [
    'Past Paper Images/Life Sciences P2 Nov 2020 Eng (2)',
    'Past Paper Images/Life Sciences P2 Nov 2020 Afr (2)',
]

ppm_files = []
for img_dir in ls_p2_dirs:
    if os.path.exists(img_dir):
        ppms = glob.glob(os.path.join(img_dir, '*.ppm'))
        if ppms:
            print(f"  Found {len(ppms)} PPM files in {os.path.basename(img_dir)}")
            ppm_files.extend(ppms)

ppm_files = sorted(ppm_files)
print(f"Total PPM files found: {len(ppm_files)}")

if not ppm_files:
    print("ERROR: No PPM files found for Life Sciences P2")
    print("Available directories:")
    all_dirs = glob.glob('Past Paper Images/Life Sciences P2*')
    for d in all_dirs:
        print(f"  {d}")
    exit(1)

# For now, let's see what questions we have and what images are available
print("\nQuestions needing images:")
for qnum in sorted(questions.keys(), key=lambda x: [int(part) for part in x.split('.')]):
    q = questions[qnum]
    if q['needs_image']:
        marker_info = f" (needs {q['marker_label']} marker)" if q['needs_marker'] else ""
        print(f"  {qnum}: {q['question'][:60]}...{marker_info}")

print(f"\nAvailable PPM files: {len(ppm_files)}")
print("First 10 PPM files:")
for i, ppm in enumerate(ppm_files[:10]):
    print(f"  {os.path.basename(ppm)}")

print("\n" + "=" * 80)
print("READY TO PROCESS")
print("=" * 80)
print("\nNext steps:")
print("1. Match questions with appropriate PPM images")
print("2. Determine marker positions for identify questions")
print("3. Convert PPMs to JPEG base64 with markers")
print("4. Update the file")
print("5. Ensure follow-up questions share images")
