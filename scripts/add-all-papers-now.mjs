/**
 * Script to add all past papers from the "past papers" directory to Firestore
 * Run with: node scripts/add-all-papers-now.mjs
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, getDocs } from 'firebase/firestore';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase config - you'll need to set these in environment or use the existing config
const firebaseConfig = {
  // This will be read from environment variables or Firebase auto-config
};

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp();
  } catch (e) {
    // Fallback to config if auto-init fails
    const configPath = join(__dirname, '../src/firebase/config.ts');
    if (existsSync(configPath)) {
      // Import the config
      const configModule = await import('../src/firebase/config.ts');
      app = initializeApp(configModule.firebaseConfig || firebaseConfig);
    } else {
      throw new Error('Firebase config not found');
    }
  }
} else {
  app = getApps()[0];
}

const firestore = getFirestore(app);

const subjectKeywords = {
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

function parseFileName(fileName) {
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

function getPairingKey(fileName) {
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

function fileToDataUri(filePath) {
    const fileBuffer = readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');
    return `data:application/pdf;base64,${base64}`;
}

function pairFiles(files) {
    const pairs = [];
    const fileGroups = new Map();
    
    // Group files by subject, year, paper number, and language
    for (const file of files) {
        if (file.subject !== 'Unknown' && file.year && file.paperNumber) {
            const key = `${file.subject}-${file.year}-p${file.paperNumber}-${file.language}`;
            if (!fileGroups.has(key)) fileGroups.set(key, []);
            fileGroups.get(key).push(file);
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
    const genericGroups = new Map();
    const pairedIds = new Set(pairs.flatMap(p => [p.paper.path, p.memo.path]));
    const remainingFiles = files.filter(f => !pairedIds.has(f.path));
    
    for (const file of remainingFiles) {
        const key = getPairingKey(file.name);
        if (!genericGroups.has(key)) genericGroups.set(key, []);
        genericGroups.get(key).push(file);
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

async function processPaper(pair, adminUserId, pastPapersCollectionRef, existingPapers) {
    try {
        // Create a unique key to check for duplicates
        const subjectName = pair.paper.paperNumber 
            ? `${pair.subject} Paper ${pair.paper.paperNumber}` 
            : pair.subject;
        const baseSubject = subjectName.replace(/\s*(?:paper|p)\s*\d+.*/i, '').trim().toLowerCase();
        const uniqueKey = `${baseSubject}_${pair.paper.year}_${pair.paper.paperNumber}_12`;
        
        if (existingPapers.has(uniqueKey)) {
            return { skipped: true };
        }

        // Convert files to data URIs
        const paperDataUri = fileToDataUri(pair.paper.path);
        const memoDataUri = fileToDataUri(pair.memo.path);
        
        // Create document first
        const docRef = await addDoc(pastPapersCollectionRef, {
            teacherId: adminUserId,
            gradeLevel: 12,
            subject: subjectName,
            year: pair.paper.year.toString(),
            paperName: pair.paper.name,
            memoName: pair.memo.name,
            status: 'Processing',
            questionCount: 0,
            generatedQuestions: [],
        });

        // Import and call processPastPaper
        const { processPastPaper } = await import('../src/ai/flows/past-paper-processing.ts');
        
        const result = await processPastPaper({
            docId: docRef.id,
            userId: adminUserId,
            paperDataUri,
            memoDataUri,
            subject: pair.subject,
            grade: 12,
            year: parseInt(pair.paper.year),
        });

        if (result.success && result.generatedQuestions) {
            await updateDoc(docRef, {
                status: 'Processed',
                questionCount: result.generatedQuestions.length,
                generatedQuestions: result.generatedQuestions,
            });
            
            return { processed: true, questionCount: result.generatedQuestions.length };
        } else {
            await updateDoc(docRef, {
                status: 'Failed',
            });
            return { failed: true, message: result.message };
        }
    } catch (error) {
        return { failed: true, message: error.message };
    }
}

async function main() {
    console.log('Starting to add all past papers...\n');
    
    // Get admin user ID - you'll need to provide this or get it from Firestore
    const ADMIN_EMAIL = 'cameronfalck03@gmail.com';
    
    // Try to get user ID from Firestore
    const usersRef = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersRef);
    let adminUserId = 'admin';
    
    for (const docSnap of usersSnapshot.docs) {
        const userData = docSnap.data();
        if (userData.email === ADMIN_EMAIL) {
            adminUserId = docSnap.id;
            break;
        }
    }
    
    console.log(`Using admin user ID: ${adminUserId}\n`);
    
    const pastPapersCollectionRef = collection(firestore, 'pastPapers');
    
    // Check for existing papers
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
    console.log(`Found ${existingDocs.size} existing papers\n`);

    const pastPapersDir = join(process.cwd(), 'past papers');
    
    if (!existsSync(pastPapersDir)) {
        console.error(`Directory "${pastPapersDir}" does not exist`);
        process.exit(1);
    }
    
    console.log(`Reading files from: ${pastPapersDir}`);
    const allFiles = readdirSync(pastPapersDir)
        .filter(f => f.toLowerCase().endsWith('.pdf'))
        .map(f => ({
            ...parseFileName(f),
            path: join(pastPapersDir, f),
        }));
    
    console.log(`Found ${allFiles.length} PDF files\n`);
    
    const pairs = pairFiles(allFiles);
    console.log(`Paired ${pairs.length} paper-memo pairs\n`);
    
    const results = {
        total: pairs.length,
        processed: 0,
        skipped: 0,
        failed: 0,
        errors: [],
    };

    // Process each pair
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        console.log(`[${i + 1}/${pairs.length}] Processing: ${pair.paper.name}`);
        
        const result = await processPaper(pair, adminUserId, pastPapersCollectionRef, existingPapers);
        
        if (result.skipped) {
            console.log(`  ✓ Already exists, skipping`);
            results.skipped++;
        } else if (result.processed) {
            console.log(`  ✓ Success! Created ${result.questionCount} questions`);
            results.processed++;
        } else {
            console.log(`  ✗ Failed: ${result.message}`);
            results.failed++;
            results.errors.push(`${pair.paper.name}: ${result.message}`);
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



