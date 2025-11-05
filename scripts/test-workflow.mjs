/**
 * Quick test script to verify the workflow is set up correctly
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

console.log('🔍 Testing workflow setup...\n');

// Check 1: Python installed
console.log('1. Checking Python installation...');
try {
    const { execSync } = require('child_process');
    const pythonVersion = execSync('python --version', { encoding: 'utf-8' }).trim();
    console.log(`   ✓ ${pythonVersion}`);
} catch (e) {
    console.log('   ✗ Python not found. Please install Python 3.');
    process.exit(1);
}

// Check 2: PyMuPDF installed
console.log('\n2. Checking PyMuPDF...');
try {
    const { execSync } = require('child_process');
    execSync('python -c "import fitz; print(\"PyMuPDF installed\")"', { encoding: 'utf-8' });
    console.log('   ✓ PyMuPDF is installed');
} catch (e) {
    console.log('   ✗ PyMuPDF not installed. Run: pip install pymupdf');
    process.exit(1);
}

// Check 3: PDF folder exists
console.log('\n3. Checking PDF folder...');
const pdfFolder = join(ROOT_DIR, 'past papers');
if (existsSync(pdfFolder)) {
    console.log(`   ✓ Found: ${pdfFolder}`);
    try {
        const { readdirSync } = require('fs');
        const pdfs = readdirSync(pdfFolder).filter(f => f.endsWith('.pdf') && !f.includes('Memo'));
        const lsP1 = pdfs.filter(f => f.includes('Life Sciences') && f.includes('P1'));
        console.log(`   ✓ Found ${pdfs.length} PDF file(s) (excluding memos)`);
        if (lsP1.length > 0) {
            console.log(`   ✓ Found ${lsP1.length} Life Sciences P1 file(s):`);
            lsP1.forEach(f => console.log(`     - ${f}`));
        }
    } catch (e) {
        console.log(`   ✗ Error reading folder: ${e.message}`);
    }
} else {
    console.log(`   ✗ Not found: ${pdfFolder}`);
    process.exit(1);
}

// Check 4: Environment variables
console.log('\n4. Checking environment variables...');
const envPath = join(ROOT_DIR, '.env.local');
if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    if (envContent.includes('GROQ_API_KEY')) {
        console.log('   ✓ .env.local found with GROQ_API_KEY');
    } else {
        console.log('   ⚠ .env.local found but GROQ_API_KEY not set');
    }
} else {
    console.log('   ⚠ .env.local not found. Create it with GROQ_API_KEY=your_key');
}

// Check 5: Firebase config
console.log('\n5. Checking Firebase config...');
const firebaseConfigPath = join(ROOT_DIR, 'src/firebase/config.ts');
if (existsSync(firebaseConfigPath)) {
    console.log('   ✓ Firebase config file found');
} else {
    console.log('   ⚠ Firebase config not found');
}

console.log('\n✅ Setup check complete!');
console.log('\n📋 Next steps:');
console.log('   1. Run: python scripts/extract_pdfs_with_metadata.py');
console.log('   2. Run: node scripts/generate_questions_with_metadata.mjs');
console.log('   3. Run: node scripts/upload_to_firebase_with_metadata.mjs');
console.log('\n   Or run all at once: node scripts/run_full_workflow.mjs');



