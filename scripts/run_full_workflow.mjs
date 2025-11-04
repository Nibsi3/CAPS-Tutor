/**
 * Full Automated Workflow Runner
 * Runs all three actions in sequence: Extract → Generate → Upload
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

async function runCommand(command, description) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`STEP: ${description}`);
    console.log('='.repeat(60));
    console.log(`Running: ${command}\n`);
    
    try {
        const { stdout, stderr } = await execAsync(command, {
            cwd: ROOT_DIR,
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });
        
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        
        return { success: true };
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(error.stderr);
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('CAPS TUTOR - FULL AUTOMATED PAST PAPER WORKFLOW');
    console.log('='.repeat(60));
    
    // Check Python availability
    try {
        await execAsync('python --version');
    } catch (error) {
        console.error('Error: Python is not installed or not in PATH');
        console.error('Please install Python 3 and PyMuPDF (pip install pymupdf)');
        process.exit(1);
    }
    
    // Step 1: Extract PDFs
    const step1 = await runCommand(
        'python scripts/extract_pdfs_with_metadata.py',
        'Action 1: Extract PDFs & Parse Metadata'
    );
    
    if (!step1.success) {
        console.error('\n❌ Step 1 failed. Stopping workflow.');
        process.exit(1);
    }
    
    // Step 2: Generate Questions
    const step2 = await runCommand(
        'node scripts/generate_questions_with_metadata.mjs',
        'Action 2: AI Question Generation'
    );
    
    if (!step2.success) {
        console.error('\n❌ Step 2 failed. Stopping workflow.');
        process.exit(1);
    }
    
    // Step 3: Upload to Firebase
    const step3 = await runCommand(
        'node scripts/upload_to_firebase_with_metadata.mjs',
        'Action 3: Upload to Firebase'
    );
    
    if (!step3.success) {
        console.error('\n❌ Step 3 failed.');
        process.exit(1);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ WORKFLOW COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
}

main().catch(console.error);

