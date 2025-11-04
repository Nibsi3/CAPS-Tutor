/**
 * Script to add all past papers from the "past papers" directory to Firestore
 * Run with: npx tsx scripts/add-all-past-papers.ts
 */

import { initializeFirebase } from '../src/firebase';
import { collection, addDoc, updateDoc, getDocs } from 'firebase/firestore';
import { processPastPaper } from '../src/ai/flows/past-paper-processing';
import * as fs from 'fs';
import * as path from 'path';

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
    "Afrikaans SAL": ["afrikaans sal", "afrikaans second additional language"],
    "Music": ["music"],
    "Design": ["design"],
    "Hospitality Studies": ["hospitality studies"],
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
    
    const type = (name.includes('memo') || name.includes('memorandum') || name.includes('answer book') || name.includes('marking guidelines') || name.includes('addendum')) ? 'memo' : 'paper';
    
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
        'eastern cape', 'free state', 'gauteng', 'kwazulu-natal', 'limpopo', 'mpumalanga', 'north west', 'northern cape', 'western cape',
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
    console.log('Initializing Firebase...');
    const { firestore } = initializeFirebase();
    const pastPapersCollectionRef = collection(firestore, 'pastPapers');
    
    // Get admin user ID - you may need to set this
    const adminUserId = process.env.ADMIN_USER_ID || 'admin';
    console.log(`Using admin user ID: ${adminUserId}`);
    
    // Check for existing papers to avoid duplicates
    console.log('Checking for existing papers...');
    const existingDocs = await getDocs(pastPapersCollectionRef);
    const existingPapers = new Set(
        existingDocs.docs.map(doc => {
            const data = doc.data();
            const subjectName = data.subject || '';
            const paperNumber = subjectName.match(/(?:paper|p)\s*(\d+)/i)?.[1] || '';
            const baseSubject = subjectName.replace(/\s*(?:paper|p)\s*\d+.*/i, '').trim().toLowerCase();
            return `${baseSubject}_${data.year}_${paperNumber}_${data.gradeLevel || 12}`.toLowerCase();
        })
    );
    console.log(`Found ${existingDocs.size} existing papers in database`);

    const pastPapersDir = path.join(process.cwd(), 'past papers');
    
    if (!fs.existsSync(pastPapersDir)) {
        console.error(`Directory "${pastPapersDir}" does not exist`);
        process.exit(1);
    }
    
    console.log(`Reading files from: ${pastPapersDir}`);
    // Read all PDF files (excluding CSV files)
    const allFiles = fs.readdirSync(pastPapersDir)
        .filter(f => f.toLowerCase().endsWith('.pdf'))
        .map(f => ({
            ...parseFileName(f),
            path: path.join(pastPapersDir, f),
        }));
    
    console.log(`Found ${allFiles.length} PDF files`);
    
    // Pair papers with memos
    const pairs = pairFiles(allFiles);
    console.log(`Paired ${pairs.length} paper-memo pairs`);
    
    const results = {
        total: pairs.length,
        processed: 0,
        skipped: 0,
        failed: 0,
        errors: [] as string[],
    };

    // Process each pair
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        console.log(`\n[${i + 1}/${pairs.length}] Processing: ${pair.paper.name}`);
        
        try {
            // Create a unique key to check for duplicates
            const subjectName = pair.paper.paperNumber 
                ? `${pair.subject} Paper ${pair.paper.paperNumber}` 
                : pair.subject;
            const baseSubject = subjectName.replace(/\s*(?:paper|p)\s*\d+.*/i, '').trim().toLowerCase();
            const uniqueKey = `${baseSubject}_${pair.paper.year}_${pair.paper.paperNumber}_12`;
            
            if (existingPapers.has(uniqueKey)) {
                console.log(`  ✓ Already exists, skipping`);
                results.skipped++;
                continue;
            }

            // Convert files to data URIs
            console.log(`  Reading PDF files...`);
            const paperDataUri = await fileToDataUri(pair.paper.path);
            const memoDataUri = await fileToDataUri(pair.memo.path);
            
            // Determine grade (assume 12 for now)
            const grade = 12;
            
            // Create document first
            console.log(`  Creating Firestore document...`);
            const docRef = await addDoc(pastPapersCollectionRef, {
                teacherId: adminUserId,
                gradeLevel: grade,
                subject: subjectName,
                year: pair.paper.year.toString(),
                paperName: pair.paper.name,
                memoName: pair.memo.name,
                status: 'Processing',
                questionCount: 0,
                generatedQuestions: [],
            });

            // Process the paper
            console.log(`  Processing with AI...`);
            const result = await processPastPaper({
                docId: docRef.id,
                userId: adminUserId,
                paperDataUri,
                memoDataUri,
                subject: pair.subject,
                grade,
                year: parseInt(pair.paper.year),
            });

            if (result.success && result.generatedQuestions) {
                // Update document with results
                await updateDoc(docRef, {
                    status: 'Processed',
                    questionCount: result.generatedQuestions.length,
                    generatedQuestions: result.generatedQuestions,
                });
                
                console.log(`  ✓ Success! Created ${result.generatedQuestions.length} questions`);
                results.processed++;
            } else {
                await updateDoc(docRef, {
                    status: 'Failed',
                });
                console.log(`  ✗ Failed: ${result.message}`);
                results.failed++;
                results.errors.push(`${subjectName} ${pair.paper.year}: ${result.message}`);
            }
        } catch (error) {
            console.log(`  ✗ Error: ${error instanceof Error ? error.message : String(error)}`);
            results.failed++;
            const errorMsg = error instanceof Error ? error.message : String(error);
            results.errors.push(`${pair.paper.name}: ${errorMsg}`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total pairs: ${results.total}`);
    console.log(`Processed: ${results.processed}`);
    console.log(`Skipped: ${results.skipped}`);
    console.log(`Failed: ${results.failed}`);
    if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach(err => console.log(`  - ${err}`));
    }
}

main().catch(console.error);



