/**
 * Get status of past papers - shows how many are in the database
 */

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
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
        
        // Get all papers
        const allDocs = await getDocs(pastPapersCollectionRef);
        
        const papers = allDocs.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                subject: data.subject,
                year: data.year,
                status: data.status,
                questionCount: data.questionCount || 0,
            };
        });
        
        // Count by status
        const byStatus = {
            Processed: papers.filter(p => p.status === 'Processed').length,
            Processing: papers.filter(p => p.status === 'Processing').length,
            Failed: papers.filter(p => p.status === 'Failed').length,
        };
        
        return Response.json({
            total: papers.length,
            byStatus,
            papers: papers.slice(0, 50), // Return first 50 as sample
        });
    } catch (error) {
        console.error('Error getting past papers status:', error);
        return Response.json(
            { 
                error: error instanceof Error ? error.message : 'Unknown error',
                total: 0,
                byStatus: { Processed: 0, Processing: 0, Failed: 0 }
            },
            { status: 500 }
        );
    }
}

