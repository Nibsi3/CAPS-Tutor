"""
Analyze all past papers and identify which ones need images added.
"""
import re
import os
import glob

# Read the past-paper-questions.ts file
with open('src/lib/past-paper-questions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all question IDs
question_id_pattern = r"id: '([^']+)'"
question_ids = re.findall(question_id_pattern, content)

# Group by paper (e.g., 'bio-p1-2020' for Life Sciences P1 2020)
# Question IDs are like 'bio-p1-2020-1.1', so we need to extract subject-paper-year
papers = {}
for qid in question_ids:
    # Split by '-' and take first 3 parts for subject, paper, year
    # e.g., 'bio-p1-2020-1.1' -> 'bio-p1-2020'
    parts = qid.split('-')
    if len(parts) >= 3:
        paper_key = '-'.join(parts[:3])  # e.g., 'bio-p1-2020'
        if paper_key not in papers:
            papers[paper_key] = []
        papers[paper_key].append(qid)

print(f"Found {len(papers)} unique past papers")
print("\nFirst 30 papers:")
for i, paper_key in enumerate(sorted(papers.keys())[:30]):
    print(f"  {paper_key}: {len(papers[paper_key])} questions")
