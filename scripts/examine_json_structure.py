#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Examine JSON structure of past paper file"""

import json
import sys

if len(sys.argv) < 2:
    print("Usage: python examine_json_structure.py <json-file>")
    sys.exit(1)

json_file = sys.argv[1]

with open(json_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=" * 80)
print("METADATA")
print("=" * 80)
print(json.dumps(data.get('metadata', {}), indent=2, ensure_ascii=False))

print("\n" + "=" * 80)
print(f"QUESTIONS: {len(data.get('questions', []))}")
print("=" * 80)

# Show first 3 questions
for i, q in enumerate(data.get('questions', [])[:3]):
    print(f"\n--- Question {i+1} ---")
    print(f"Question Number: {q.get('question_number')}")
    print(f"Question Type: {q.get('question_type')}")
    print(f"Page Number: {q.get('page_number')}")
    print(f"Has Images: {bool(q.get('images'))}")
    print(f"Images Count: {len(q.get('images', []))}")
    print(f"Question Text (first 300 chars):")
    print(q.get('question_text', '')[:300] if q.get('question_text') else 'None')
    print(f"\nFull Text (first 500 chars):")
    print(q.get('full_text', '')[:500] if q.get('full_text') else 'None')
    if q.get('images'):
        print(f"\nImages:")
        for img_idx, img in enumerate(q.get('images', [])[:2]):
            print(f"  Image {img_idx+1}: {type(img).__name__}")
            if isinstance(img, dict):
                print(f"    Keys: {list(img.keys())}")

# Show question type distribution
print("\n" + "=" * 80)
print("QUESTION TYPE DISTRIBUTION")
print("=" * 80)
type_counts = {}
for q in data.get('questions', []):
    q_type = q.get('question_type', 'unknown')
    type_counts[q_type] = type_counts.get(q_type, 0) + 1
for q_type, count in sorted(type_counts.items()):
    print(f"  {q_type}: {count}")

# Show image distribution
print("\n" + "=" * 80)
print("IMAGE DISTRIBUTION")
print("=" * 80)
questions_with_images = sum(1 for q in data.get('questions', []) if q.get('images'))
total_images = sum(len(q.get('images', [])) for q in data.get('questions', []))
print(f"  Questions with images: {questions_with_images}/{len(data.get('questions', []))}")
print(f"  Total images: {total_images}")


