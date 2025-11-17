#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Batch PDF Extraction for Past Papers
Processes multiple PDFs in a folder and extracts all questions and images
"""

import sys
import os
import json
from pathlib import Path
from extract_paper_simple import extract_paper, parse_metadata

def batch_extract(input_folder: str, output_folder: str = './extracted_papers'):
    """Extract all PDFs in a folder"""
    
    # Create output folder
    os.makedirs(output_folder, exist_ok=True)
    
    # Find all PDF files
    pdf_files = list(Path(input_folder).glob('**/*.pdf'))
    
    if not pdf_files:
        print(f"No PDF files found in {input_folder}")
        return []
    
    print(f"Found {len(pdf_files)} PDF files")
    print("="*60)
    
    results = []
    
    for pdf_path in pdf_files:
        print(f"\nProcessing: {pdf_path.name}")
        
        # Skip memos for now (process them separately if needed)
        if 'memo' in pdf_path.name.lower():
            print("  [SKIP] Memo file")
            continue
        
        try:
            # Create output directory for this paper
            paper_name = pdf_path.stem
            paper_output = os.path.join(output_folder, paper_name)
            os.makedirs(paper_output, exist_ok=True)
            
            # Extract paper
            result = extract_paper(str(pdf_path), paper_output)
            
            # Save JSON
            json_path = os.path.join(paper_output, 'extracted.json')
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            results.append({
                'filename': pdf_path.name,
                'path': str(pdf_path),
                'output': paper_output,
                'json': json_path,
                'questions': result['totalQuestions'],
                'images': result['totalImages'],
                'success': True
            })
            
            print(f"  [OK] {result['totalQuestions']} questions, {result['totalImages']} images")
            
        except Exception as e:
            print(f"  [ERROR] {e}")
            results.append({
                'filename': pdf_path.name,
                'path': str(pdf_path),
                'success': False,
                'error': str(e)
            })
    
    # Save summary
    summary_path = os.path.join(output_folder, 'extraction_summary.json')
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump({
            'total_files': len(results),
            'successful': len([r for r in results if r.get('success')]),
            'failed': len([r for r in results if not r.get('success')]),
            'results': results
        }, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print(f"Batch extraction complete!")
    print(f"  Total: {len(results)}")
    print(f"  Successful: {len([r for r in results if r.get('success')])}")
    print(f"  Failed: {len([r for r in results if not r.get('success')])}")
    print(f"  Summary saved to: {summary_path}")
    
    return results

def main():
    if len(sys.argv) < 2:
        print("Usage: python batch_extract.py <input_folder> [output_folder]")
        print("Example: python batch_extract.py './past papers' './extracted_papers'")
        sys.exit(1)
    
    input_folder = sys.argv[1]
    output_folder = sys.argv[2] if len(sys.argv) > 2 else './extracted_papers'
    
    if not os.path.exists(input_folder):
        print(f"Error: Input folder not found: {input_folder}")
        sys.exit(1)
    
    batch_extract(input_folder, output_folder)

if __name__ == "__main__":
    main()
