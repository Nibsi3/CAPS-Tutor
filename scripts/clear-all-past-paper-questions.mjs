/**
 * Script to clear all generatedQuestions from all past papers in Firestore
 * 
 * OPTION 1: Use the API endpoint (requires server to be running):
 *   curl -X POST http://localhost:3000/api/clear-all-past-paper-questions
 * 
 * OPTION 2: Run this script directly:
 *   node scripts/clear-all-past-paper-questions.mjs
 * 
 * Note: This script uses the Firebase client SDK. Make sure you have
 * Firebase credentials configured in your environment.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase config - using default values from config.ts
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-3238820292-69b8f",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:709416001139:web:e5ede79f65173ca0069406",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "***REMOVED***",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-3238820292-69b8f.firebaseapp.com",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "709416001139"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp();
  } catch (e) {
    // Use the config directly
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApps()[0];
}

const firestore = getFirestore(app);

async function clearAllQuestions() {
    console.log('🚀 Starting to clear all past paper questions...\n');
    
    try {
        const pastPapersCollectionRef = collection(firestore, 'pastPapers');
        
        // Get all past paper documents
        const allDocs = await getDocs(pastPapersCollectionRef);
        
        if (allDocs.empty) {
            console.log('✅ No past papers found in database.');
            return;
        }
        
        console.log(`📊 Found ${allDocs.size} past papers to update\n`);
        
        let updated = 0;
        let errors = [];
        
        // Process in batches of 500 (Firestore batch limit)
        const BATCH_SIZE = 500;
        const docsArray = Array.from(allDocs.docs);
        
        for (let i = 0; i < docsArray.length; i += BATCH_SIZE) {
            const batch = writeBatch(firestore);
            const batchDocs = docsArray.slice(i, i + BATCH_SIZE);
            
            for (const document of batchDocs) {
                try {
                    const docRef = doc(firestore, 'pastPapers', document.id);
                    batch.update(docRef, {
                        generatedQuestions: [],
                        questionCount: 0,
                    });
                } catch (error) {
                    errors.push({ id: document.id, error: error.message });
                }
            }
            
            try {
                await batch.commit();
                updated += batchDocs.length;
                console.log(`✅ Updated ${updated} / ${allDocs.size} papers...`);
            } catch (error) {
                console.error(`❌ Error committing batch:`, error);
                errors.push({ id: 'batch', error: error.message });
            }
        }
        
        console.log(`\n✨ Process Complete!`);
        console.log(`✅ Successfully cleared questions from ${updated} papers`);
        if (errors.length > 0) {
            console.log(`❌ Errors: ${errors.length}`);
            errors.forEach(e => console.log(`   - ${e.id}: ${e.error}`));
        }
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

clearAllQuestions()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });

