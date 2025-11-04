#!/usr/bin/env python3
"""Add images to Life Sciences P2 questions"""
import re
import os
import glob
import base64
import json
from PIL import Image, ImageDraw, ImageFont
import io

def add_modern_marker(img, position, label):
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
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), label, font=font)
    text_x = x - (bbox[2] - bbox[0]) // 2
    text_y = y - (bbox[3] - bbox[1]) // 2 - 8
    draw.text((text_x + 2, text_y + 2), label, fill='#1e40af', font=font)
    draw.text((text_x, text_y), label, fill='#2563eb', font=font)

def convert_ppm_to_jpeg_base64(ppm_path, marker_position=None, marker_label=None):
    img = Image.open(ppm_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    width, height = img.size
    if marker_position is None and marker_label:
        marker_position = (width // 4, height // 2)
    if marker_position and marker_label:
        add_modern_marker(img, marker_position, marker_label)
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=95)
    img_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f'data:image/jpeg;base64,{img_b64}'

print("Life Sciences P2 Image Processing")
print("=" * 60)

# Read file
with open('src/lib/past-paper-questions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Get PPM files
img_dir = 'Past Paper Images/Life Sciences P2 Nov 2020 Eng (2)'
ppm_files = sorted(glob.glob(os.path.join(img_dir, '*.ppm')))
print(f"Found {len(ppm_files)} PPM files")

# Extract questions - simple pattern
pattern = r"id: 'bio-p2-2020-([^']+)',.*?questionNumber: '([^']+)',.*?question: '([^']+)'"
matches = re.findall(pattern, content, re.DOTALL)

questions = []
for match in matches:
    qid = f"bio-p2-2020-{match[0]}"
    qnum = match[1]
    qtext = match[2]
    marker_match = re.search(r'identify\s+([A-Z])', qtext, re.IGNORECASE)
    marker = marker_match.group(1).upper() if marker_match else None
    needs_image = any(w in qtext.lower() for w in ['heart', 'neuron', 'cell', 'structure', 'chamber', 'system'])
    questions.append({'qid': qid, 'qnum': qnum, 'question': qtext, 'marker': marker, 'needs_image': needs_image})

questions.sort(key=lambda x: [int(p) for p in x['qnum'].split('.')])

print(f"Found {len(questions)} questions")
print(f"Questions needing images: {sum(1 for q in questions if q['needs_image'])}")

# Group by main question
groups = {}
for q in questions:
    main = q['qnum'].split('.')[0]
    if main not in groups:
        groups[main] = []
    groups[main].append(q)

# Process first few groups that need images
print("\nProcessing question groups...")
conversions = {}
ppm_idx = 0

for main_q in sorted(groups.keys(), key=int)[:10]:  # Process first 10 groups
    group = groups[main_q]
    if any(q['needs_image'] for q in group) and ppm_idx < len(ppm_files):
        first_q = group[0]
        base64_data = convert_ppm_to_jpeg_base64(ppm_files[ppm_idx], marker_label=first_q['marker'])
        conversions[first_q['qnum']] = base64_data
        # Share image with all follow-up questions in the group
        for q in group[1:]:
            conversions[q['qnum']] = base64_data
        print(f"  Processed group {main_q}: {first_q['qnum']} (shared with {len(group)-1} follow-ups)")
        ppm_idx += 1

print(f"\nProcessed {len(conversions)} question images")

# Save to JSON for Node.js script
with open('scripts/ls-p2-image-conversions.json', 'w') as f:
    json.dump(conversions, f, indent=2)

print(f"Saved conversions to scripts/ls-p2-image-conversions.json")
print("Next: Run Node.js script to update past-paper-questions.ts")
