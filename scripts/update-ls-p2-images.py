"""Update past-paper-questions.ts with Life Sciences P2 images"""
import re
import json

print("Updating Life Sciences P2 images in past-paper-questions.ts...")

# Read conversions
with open('scripts/ls-p2-image-conversions.json', 'r') as f:
    conversions = json.load(f)

print(f"Loaded {len(conversions)} image conversions")

# Read file
with open('src/lib/past-paper-questions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

updated_count = 0

# Update each question
for qnum, base64_data in conversions.items():
    # Escape question number for regex
    escaped_qnum = qnum.replace('.', r'\.')
    
    # Pattern to find the question block: id: 'bio-p2-2020-X', ... questionNumber: 'qnum', ...
    # We need to find the question block and add/update imageUrl
    pattern = rf"(id: 'bio-p2-2020-[^']+',[^{{}}]*?questionNumber: '{escaped_qnum}',[^{{}}]*?)(question: '[^']+',[^{{}}]*?)(type: '[^']+',[^{{}}]*?)(\s*\}})"
    
    def replacer(m):
        before = m.group(1)
        question_part = m.group(2)
        type_part = m.group(3)
        closing = m.group(4)
        
        # Check if imageUrl already exists in this block
        if 'imageUrl:' in before + question_part + type_part:
            # Replace existing
            full_block = before + question_part + type_part
            new_block = re.sub(
                r"imageUrl: '[^']*'",
                f"imageUrl: '{base64_data}'",
                full_block
            )
            return new_block + closing
        else:
            # Add new imageUrl before type
            return before + question_part + f"\n          imageUrl: '{base64_data}'," + type_part + closing
    
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    if new_content != content:
        content = new_content
        updated_count += 1
        print(f"  Updated question {qnum}")
    else:
        # Try a simpler pattern
        pattern2 = rf"(questionNumber: '{escaped_qnum}',[^{{}}]*?)(type: '[^']+',[^{{}}]*?)(\s*\}})"
        def replacer2(m):
            before = m.group(1)
            type_part = m.group(2)
            closing = m.group(3)
            if 'imageUrl:' not in before + type_part:
                return before + f"\n          imageUrl: '{base64_data}'," + type_part + closing
            return m.group(0)
        new_content2 = re.sub(pattern2, replacer2, content, flags=re.DOTALL)
        if new_content2 != content:
            content = new_content2
            updated_count += 1
            print(f"  Updated question {qnum} (method 2)")
        else:
            print(f"  WARNING: Could not update question {qnum}")

if updated_count > 0:
    with open('src/lib/past-paper-questions.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"\nSuccessfully updated {updated_count} questions with images!")
else:
    print("\n✗ No updates made. Check the patterns.")
