#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { buildExtractedPaperV3 } from '@/lib/extraction';
import type { ExtractionOptions } from '@/lib/extraction';
import type { PyMuPDFExtractionResult } from '@/lib/pdf-pymupdf-extractor';

interface CliArgs {
  input: string;
  output?: string;
  memo?: string;
  subject?: string;
  grade?: number;
  paper?: string;
  year?: number;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { input: '' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = argv[i + 1];
    switch (key) {
      case 'input':
        args.input = value;
        i++;
        break;
      case 'output':
        args.output = value;
        i++;
        break;
      case 'memo':
        args.memo = value;
        i++;
        break;
      case 'subject':
        args.subject = value;
        i++;
        break;
      case 'grade':
        args.grade = Number(value);
        i++;
        break;
      case 'paper':
        args.paper = value;
        i++;
        break;
      case 'year':
        args.year = Number(value);
        i++;
        break;
      default:
        break;
    }
  }
  if (!args.input) {
    throw new Error('Missing --input <path-to-extraction.json>');
  }
  return args;
}

function readJsonFile<T>(filePath: string): T {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

function resolveOutputPath(inputPath: string, output?: string): string {
  if (output) return output;
  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath, path.extname(inputPath));
  return path.join(dir, `${base}_extracted.json`);
}

async function main() {
  try {
    const [, , ...argv] = process.argv;
    const cliArgs = parseArgs(argv);

    const extraction = readJsonFile<PyMuPDFExtractionResult>(cliArgs.input);
    const options: ExtractionOptions = {
      subject: cliArgs.subject,
      grade: cliArgs.grade,
      paper: cliArgs.paper,
      year: cliArgs.year,
    };

    if (cliArgs.memo) {
      options.memoText = readFileSync(cliArgs.memo, 'utf-8');
    }

    const result = buildExtractedPaperV3(extraction, options);
    const outputPath = resolveOutputPath(cliArgs.input, cliArgs.output);
    writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    console.log(
      `✅ Extracted ${result.questions.length} question(s) → ${path.relative(process.cwd(), outputPath)}`
    );
  } catch (error) {
    console.error('❌ Extraction failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
