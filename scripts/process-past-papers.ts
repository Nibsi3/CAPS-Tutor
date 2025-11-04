/**
 * Script to process past papers from the local directory and upload them to Firestore
 * Run with: npx tsx scripts/process-past-papers.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { processPastPaper } from '../src/ai/flows/past-paper-processing';

// Initialize Firebase Admin (you'll need to set up service account)
// For now, we'll use the client SDK approach with a script that runs in the Next.js environment

// File parsing logic from admin page
const subjectKeywords: Record<string, string[]> = {
    "Mathematics": ["mathematics", "maths", "wiskunde"],
    "Physical Sciences": ["physical sciences", "physical science", "phys sci", "fisiese wetenskappe"],
    "Life Sciences": ["life sciences", "life science", "life sci", "bio", "lewenswetenskappe"],
    "Accounting": ["accounting", "rekeningkunde"],
    "Business Studies": ["business studies", "bus stud", "besigheidstudies"],
    "Economics": ["economics", "ekonomie"],
    "Geography": ["geography", "geo", "aardrykskunde"],
    "History": ["history", "geskiedenis"],
    "Tourism": ["tourism", "toerisme"],
    "Computer Applications Technology": ["cat", "computer applications technology"],
    "Information Technology": ["it", "information technology"],
    "Consumer Studies": ["consumer studies", "verbruikerstudie"],
    "Engineering Graphics & Design": ["egd", "engineering graphics", "engineering graphics & design"],
    "Mathematical Literacy": ["maths lit", "math lit", "mathematical literacy", "wiskundige geletterdheid"],
    "Technical Sciences": ["technical sciences"],
    "Visual Arts": ["visual arts"],
    "Mechanical Technology": ["mechanical technology", "mechanical tech"],
    "Dance Studies": ["dance studies"],
    "Civil Technology": ["civil technology", "civil tech"],
    "Dramatic Arts": ["dramatic arts"],
    "Electrical Technology": ["electrical technology", "electrical tech"],
    "Agricultural Management Practices": ["agricultural management practices", "agric management"],
    "Agricultural Sciences": ["agricultural sciences", "agric sci", "agricultural science"],
    "Agricultural Technology": ["agricultural technology", "agric tech"],
    "English FAL": ["english fal", "english first additional language"],
    "English HL": ["english hl", "english home language"],
    "Afrikaans HT": ["afrikaans ht", "afrikaans huistaal"],
    "Afrikaans EAT": ["afrikaans eat", "afrikaans eerste addisionele taal"],
};

interface FileInfo {
    path: string;
    name: string;
    subject: string;
    year: string;
    type: 'paper' | 'memo';
    language: string;
    paperNumber: string;
}

function parseFileName(fileName: string): Omit<FileInfo, 'path'> {
    const name = fileName.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ');
    
    const type = (name.includes('memo') || name.includes('memorandum') || name.includes('answer book') || name.includes('marking guidelines')) ? 'memo' : 'paper';
    
    const yearMatch = name.match(/20\d{2}/) || name.match(/(?<=\s)\d{2}(?=\s|$)/);
    const year = yearMatch ? (yearMatch[0].length === 2 ? `20${yearMatch[0]}` : yearMatch[0]) : '';
    
    let subject = 'Unknown';
    let bestMatchLength = 0;
    for (const [subj, keywords] of Object.entries(subjectKeywords)) {
        for (const kw of keywords) {
            if (name.includes(kw) && kw.length > bestMatchLength) {
                subject = subj;
                bestMatchLength = kw.length;
            }
        }
    }

    let language = 'Unknown';
    if (name.includes('eng') || name.includes('english')) {
        language = 'ENG';
    } else if (name.includes('afr') || name.includes('afrikaans')) {
        language = 'AFR';
    }

    let paperNumber = '';
    const paperMatch = name.match(/p(\d)|paper\s?(\d)/);
    if (paperMatch) {
        paperNumber = paperMatch[1] || paperMatch[2];
    }
    
    return { name: fileName, subject, year, type, paperNumber, language };
}

function getPairingKey(fileName: string): string {
    const noiseWords = [
        'memo', 'memorandum', 'answer book', 'marking guidelines', 'addendum',
        'nsc', 'ieb', 'sc', 
        'eng', 'afr', 'english', 'afrikaans',
        'hl', 'ht', 'fal', 'eat', 'huistaal', 'eerste addisionele taal', 'home language', 'first additional language',
        'fs', 'gp', 'wc', 'ec', 'nc', 'nw', 'lp', 'mp',
    ];

    const noiseRegex = new RegExp(`\\b(${noiseWords.join('|')})\\b`, 'gi');
    
    let cleanName = fileName.toLowerCase()
        .replace(/\.(pdf|docx|doc)$/i, '')
        .replace(noiseRegex, '')
        .replace(/p\d/gi, '')
        .replace(/\(1\)|\(2\)|\(3\)/g, '')
        .replace(/[^a-z0-9]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
    cleanName = cleanName.replace(/20\d{2}/g, '').trim();

    return cleanName;
}

async function fileToDataUri(filePath: string): Promise<string> {
    const fileBuffer = await fs.promises.readFile(filePath);
    const base64 = fileBuffer.toString('base64');
    return `data:application/pdf;base64,${base64}`;
}

interface PaperMemoPair {
    paper: FileInfo;
    memo: FileInfo;
    subject: string;
}

function pairFiles(files: FileInfo[]): PaperMemoPair[] {
    const pairs: PaperMemoPair[] = [];
    const fileGroups = new Map<string, FileInfo[]>();
    
    // Group files by subject, year, paper number, and language
    for (const file of files) {
        if (file.subject !== 'Unknown' && file.year && file.paperNumber) {
            const key = `${file.subject}-${file.year}-p${file.paperNumber}-${file.language}`;
            if (!fileGroups.has(key)) fileGroups.set(key, []);
            fileGroups.get(key)!.push(file);
        }
    }
    
    // Pair papers with memos
    for (const [key, groupFiles] of fileGroups.entries()) {
        const paper = groupFiles.find(f => f.type === 'paper');
        const memo = groupFiles.find(f => f.type === 'memo');
        
        if (paper && memo) {
            pairs.push({ paper, memo, subject: paper.subject });
        }
    }
    
    // Also try generic pairing for remaining files
    const genericGroups = new Map<string, FileInfo[]>();
    const pairedIds = new Set(pairs.flatMap(p => [p.paper.path, p.memo.path]));
    const remainingFiles = files.filter(f => !pairedIds.has(f.path));
    
    for (const file of remainingFiles) {
        const key = getPairingKey(file.name);
        if (!genericGroups.has(key)) genericGroups.set(key, []);
        genericGroups.get(key)!.push(file);
    }
    
    for (const [key, groupFiles] of genericGroups.entries()) {
        if (key && groupFiles.length >= 2) {
            const paper = groupFiles.find(f => f.type === 'paper');
            const memo = groupFiles.find(f => f.type === 'memo');
            
            if (paper && memo) {
                pairs.push({ paper, memo, subject: paper.subject });
            }
        }
    }
    
    return pairs;
}

async function main() {
    console.log('Starting past paper processing...\n');
    
    const pastPapersDir = path.join(process.cwd(), 'past papers');
    
    if (!fs.existsSync(pastPapersDir)) {
        console.error(`Error: Directory "${pastPapersDir}" does not exist.`);
        process.exit(1);
    }
    
    // Read all PDF files
    const allFiles = fs.readdirSync(pastPapersDir)
        .filter(f => f.toLowerCase().endsWith('.pdf'))
        .map(f => ({
            ...parseFileName(f),
            path: path.join(pastPapersDir, f),
        }));
    
    console.log(`Found ${allFiles.length} PDF files\n`);
    
    // Pair papers with memos
    const pairs = pairFiles(allFiles);
    console.log(`Paired ${pairs.length} paper-memo pairs\n`);
    
    if (pairs.length === 0) {
        console.log('No paper-memo pairs found. Exiting.');
        return;
    }
    
    // Process each pair
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        console.log(`\n[${i + 1}/${pairs.length}] Processing: ${pair.paper.name}`);
        console.log(`  Subject: ${pair.subject}, Year: ${pair.paper.year}, Paper: ${pair.paper.paperNumber || 'N/A'}`);
        
        try {
            // Convert files to data URIs
            const paperDataUri = await fileToDataUri(pair.paper.path);
            const memoDataUri = await fileToDataUri(pair.memo.path);
            
            // Determine grade (assume 12 for now, as most past papers are Grade 12)
            const grade = 12;
            
            // Create subject name with paper number if available
            const subjectName = pair.paper.paperNumber 
                ? `${pair.subject} Paper ${pair.paper.paperNumber}` 
                : pair.subject;
            
            // Process the paper
            const result = await processPastPaper({
                docId: `temp-${Date.now()}-${i}`, // Temporary ID
                userId: 'system-processor', // System user ID
                paperDataUri,
                memoDataUri,
                subject: pair.subject,
                grade,
                year: parseInt(pair.paper.year),
            });
            
            if (result.success && result.generatedQuestions) {
                console.log(`  ✓ Generated ${result.generatedQuestions.length} questions`);
                console.log(`  Total marks: ${result.generatedQuestions.reduce((sum, q) => sum + q.marks, 0)}`);
                
                // TODO: Write to Firestore here
                // You'll need to set up Firebase Admin SDK or use a different approach
                console.log(`  ⚠ Questions generated but not yet saved to Firestore`);
                console.log(`  ⚠ You'll need to manually upload this paper through the admin interface`);
                console.log(`  ⚠ Or set up Firebase Admin SDK to save directly`);
            } else {
                console.log(`  ✗ Failed: ${result.message}`);
            }
        } catch (error) {
            console.error(`  ✗ Error processing: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    console.log('\n\nProcessing complete!');
    console.log('\nNOTE: This script generates questions but does not save them to Firestore yet.');
    console.log('To save them, you can either:');
    console.log('1. Use the admin interface to upload and process');
    console.log('2. Set up Firebase Admin SDK in this script');
}

if (require.main === module) {
    main().catch(console.error);
}

