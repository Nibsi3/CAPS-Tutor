/**
 * Clear Life Sciences Paper 1 questions from Firestore
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';
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

async function clearLifeSciencesP1() {
    console.log('Clearing Life Sciences Paper 1 questions...\n');
    
    let app;
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    const db = getFirestore(app);
    
    const pastPapersRef = collection(db, 'pastPapers');
    const q = query(
        pastPapersRef,
        where('subject', '==', 'Life Sciences Paper 1'),
        where('year', '==', '2020')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        console.log('No Life Sciences Paper 1 documents found');
        return;
    }
    
    for (const docSnap of snapshot.docs) {
        const docRef = doc(db, 'pastPapers', docSnap.id);
        await updateDoc(docRef, {
            generatedQuestions: [],
            questionCount: 0,
            status: 'Processing'
        });
        console.log(`Cleared questions from document: ${docSnap.id}`);
    }
    
    console.log(`\nCleared ${snapshot.size} document(s)`);
}

clearLifeSciencesP1().catch(console.error);



