"""
Extract PDF to JSON and save to desktop.
Usage: python extract_to_desktop.py <pdf_path>
"""

import sys
import os
from pathlib import Path
from pdf_parser_pipeline import PDFPipeline

def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_to_desktop.py <pdf_path>")
        print("\nExample:")
        print('  python extract_to_desktop.py "C:\\Users\\cameron\\Documents\\past papers\\Life Sciences P1 Nov 2020.pdf"')
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not os.path.exists(pdf_path):
        print(f"ERROR: PDF file not found: {pdf_path}")
        sys.exit(1)
    
    # Get PDF filename without extension for output naming
    pdf_name = Path(pdf_path).stem
    desktop_path = Path.home() / "Desktop"
    output_json = desktop_path / f"{pdf_name}_extracted.json"
    
    print(f"Extracting PDF: {pdf_path}")
    print(f"Output will be saved to: {output_json}")
    print()
    
    # Create pipeline
    pipeline = PDFPipeline(
        dpi=300,
        output_dir="tmp",
        ollama_model="llama3.2-vision:latest",
        use_llm=True
    )
    
    # Process PDF
    pdf_files = [(pdf_path, "question_paper")]
    results = pipeline.process_multiple(pdf_files, skip_memos=True)
    
    # Save to desktop
    with open(output_json, 'w', encoding='utf-8') as f:
        import json
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print()
    print("=" * 60)
    print("Extraction complete!")
    print(f"JSON saved to: {output_json}")
    print(f"Total questions: {results.get('total_questions', 0)}")
    print(f"Total images: {results.get('total_images', 0)}")
    print("=" * 60)

if __name__ == "__main__":
    main()

