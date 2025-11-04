import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

/**
 * API route to permanently delete all generatedQuestions from all past papers in Firestore
 * This will clear all question data while keeping the paper documents themselves
 * TEMPORARY: Uses simplified rule (allow update: if true) to clear questions
 */
export async function POST(request: Request) {
    try {
        // Initialize Firebase for server-side use
        let app;
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
        const firestore = getFirestore(app);
        const pastPapersCollectionRef = collection(firestore, 'pastPapers');
        
        // Get all past paper documents
        const allDocs = await getDocs(pastPapersCollectionRef);
        
        const results = {
            total: allDocs.size,
            updated: 0,
            errors: [] as string[],
        };

        // Update each document to remove generatedQuestions and set questionCount to 0
        // Temporary rule allows all updates
        for (const document of allDocs.docs) {
            try {
                const docRef = doc(firestore, 'pastPapers', document.id);
                await updateDoc(docRef, {
                    generatedQuestions: [],
                    questionCount: 0,
                });
                results.updated++;
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                results.errors.push(`${document.id}: ${errorMsg}`);
            }
        }
        
        return Response.json({
            success: true,
            message: `Cleared questions from ${results.updated} out of ${results.total} past papers`,
            ...results,
        });
    } catch (error) {
        console.error('Error clearing past paper questions:', error);
        return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

