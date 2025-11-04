import { processPastPaper } from '@/ai/flows/past-paper-processing';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
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

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();
        
        if (!userId) {
            return Response.json({ error: 'User ID is required' }, { status: 400 });
        }

        const { firestore } = initializeFirebase();
        const pastPapersCollectionRef = collection(firestore, 'pastPapers');
        
        // Check for existing papers to avoid duplicates
        const existingPapersQuery = query(pastPapersCollectionRef);
        const existingDocs = await getDocs(existingPapersQuery);
        const existingPapers = new Set(
            existingDocs.docs.map(doc => {
                const data = doc.data();
                return `${data.subject}-${data.year}-${data.gradeLevel}`.toLowerCase();
            })
        );

        const pastPapersDir = path.join(process.cwd(), 'past papers');
        
        if (!fs.existsSync(pastPapersDir)) {
            return Response.json({ error: `Directory "${pastPapersDir}" does not exist` }, { status: 404 });
        }
        
        // Read all PDF files
        const allFiles = fs.readdirSync(pastPapersDir)
            .filter(f => f.toLowerCase().endsWith('.pdf'))
            .map(f => ({
                ...parseFileName(f),
                path: path.join(pastPapersDir, f),
            }));
        
        // Pair papers with memos
        const pairs = pairFiles(allFiles);
        
        const results = {
            total: pairs.length,
            processed: 0,
            skipped: 0,
            failed: 0,
            errors: [] as string[],
        };

        // Process each pair
        for (const pair of pairs) {
            try {
                // Create a unique key to check for duplicates
                const subjectName = pair.paper.paperNumber 
                    ? `${pair.subject} Paper ${pair.paper.paperNumber}` 
                    : pair.subject;
                const uniqueKey = `${subjectName}-${pair.paper.year}-12`.toLowerCase();
                
                if (existingPapers.has(uniqueKey)) {
                    results.skipped++;
                    continue;
                }

                // Convert files to data URIs
                const paperDataUri = await fileToDataUri(pair.paper.path);
                const memoDataUri = await fileToDataUri(pair.memo.path);
                
                // Determine grade (assume 12 for now)
                const grade = 12;
                
                // Create document first (as string for year to match Firestore schema)
                const docRef = await addDoc(pastPapersCollectionRef, {
                    teacherId: userId,
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
                const result = await processPastPaper({
                    docId: docRef.id,
                    userId: userId,
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
                    
                    results.processed++;
                } else {
                    await updateDoc(docRef, {
                        status: 'Failed',
                    });
                    results.failed++;
                    results.errors.push(`${subjectName} ${pair.paper.year}: ${result.message}`);
                }
            } catch (error) {
                results.failed++;
                const errorMsg = error instanceof Error ? error.message : String(error);
                results.errors.push(`${pair.paper.name}: ${errorMsg}`);
            }
        }
        
        return Response.json({
            success: true,
            message: `Processed ${results.processed} papers, skipped ${results.skipped} duplicates, failed ${results.failed}`,
            ...results,
        });
    } catch (error) {
        console.error('Error processing past papers:', error);
        return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

