const fs = require('fs');

const QUESTIONS_FILE = 'src/lib/past-paper-questions.ts';
const CONVERSIONS_FILE = 'scripts/all-papers-image-conversions.json';

console.log('Updating past paper questions with images...');

if (!fs.existsSync(CONVERSIONS_FILE)) {
    console.error(`Error: ${CONVERSIONS_FILE} not found`);
    process.exit(1);
}

const conversions = JSON.parse(fs.readFileSync(CONVERSIONS_FILE, 'utf-8'));
console.log(`Loaded ${Object.keys(conversions).length} conversions`);

let content = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
let updated = 0;

// Update each question with its image
for (const [qid, imageData] of Object.entries(conversions)) {
    // Escape special regex characters in qid
    const escapedQid = qid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Pattern 1: Has imageUrl
    const pattern1 = new RegExp(`(id: '${escapedQid}',[^}]*?imageUrl: ')([^']*)(')`, 'gs');
    // Pattern 2: No imageUrl
    const pattern2 = new RegExp(`(id: '${escapedQid}',[^}]*?type: '[^']+')([,}])`, 'gs');
    
    if (pattern1.test(content)) {
        content = content.replace(pattern1, `$1${imageData.replace(/'/g, "\\'")}$3`);
        updated++;
    } else if (pattern2.test(content)) {
        content = content.replace(pattern2, `$1,\n          imageUrl: '${imageData.replace(/'/g, "\\'")}'$2`);
        updated++;
    }
}

fs.writeFileSync(QUESTIONS_FILE, content, 'utf-8');
console.log(`Updated ${updated} questions`);
