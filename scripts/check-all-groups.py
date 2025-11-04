import re

with open('src/lib/past-paper-questions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find ALL questions in order
all_questions = re.findall(r"questionNumber: '([^']+)'", content)
all_qs_with_bio = [q for q in all_questions if q and len(q) <= 6]  # Filter valid question numbers

print(f'Total questions: {len(all_qs_with_bio)}')
print(f'First 50: {all_qs_with_bio[:50]}')


