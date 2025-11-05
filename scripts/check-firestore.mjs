/**
 * Diagnostic script to check what's in Firestore
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "***REMOVED***",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-3238820292-69b8f.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-3238820292-69b8f",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:709416001139:web:e5ede79f65173ca0069406",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "709416001139"
};

async function checkFirestore() {
    console.log('🔍 Checking Firestore for past papers...\n');
    
    // Initialize Firebase
    let app;
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    const db = getFirestore(app);
    
    // Get all papers
    const pastPapersRef = collection(db, 'pastPapers');
    const snapshot = await getDocs(pastPapersRef);
    
    console.log(`Found ${snapshot.size} document(s) in pastPapers collection\n`);
    
    if (snapshot.empty) {
        console.log('❌ No papers found in Firestore!');
        console.log('\n📋 You need to run the workflow:');
        console.log('   1. python scripts/extract_pdfs_with_metadata.py');
        console.log('   2. node scripts/generate_questions_with_metadata.mjs');
        console.log('   3. node scripts/upload_to_firebase_with_metadata.mjs');
        return;
    }
    
    // Check for Life Sciences P1
    const lifeSciencesP1 = [];
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.subject && data.subject.includes('Life Sciences') && data.subject.includes('Paper 1')) {
            lifeSciencesP1.push({ id: doc.id, ...data });
        }
    });
    
    if (lifeSciencesP1.length > 0) {
        console.log(`✅ Found ${lifeSciencesP1.length} Life Sciences Paper 1 document(s):\n`);
        lifeSciencesP1.forEach(paper => {
            console.log(`   Document ID: ${paper.id}`);
            console.log(`   Subject: ${paper.subject}`);
            console.log(`   Year: ${paper.year}`);
            console.log(`   Status: ${paper.status || 'Unknown'}`);
            console.log(`   Question Count: ${paper.questionCount || 0}`);
            console.log(`   Generated Questions: ${paper.generatedQuestions?.length || 0}`);
            console.log(`   Has generatedQuestions array: ${paper.generatedQuestions ? 'Yes' : 'No'}`);
            if (paper.generatedQuestions && paper.generatedQuestions.length > 0) {
                console.log(`   First question: ${paper.generatedQuestions[0].questionNumber} - ${paper.generatedQuestions[0].questionText.substring(0, 50)}...`);
            }
            console.log('');
        });
    } else {
        console.log('❌ No Life Sciences Paper 1 found in Firestore');
        console.log('\n📋 Available papers:');
        snapshot.docs.slice(0, 5).forEach(doc => {
            const data = doc.data();
            console.log(`   - ${data.subject || 'Unknown'} (${data.year || '?'}) - ${doc.id}`);
        });
    }
}

checkFirestore().catch(console.error);



