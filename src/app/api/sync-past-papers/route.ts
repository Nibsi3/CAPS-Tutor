import { initializeFirebase } from '@/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();
        
        if (!userId) {
            return Response.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Lazy import to avoid loading the entire file on module initialization
        const { pastPaperQuestionsData } = await import('@/lib/past-paper-questions');

        const { firestore } = initializeFirebase();
        const pastPapersCollectionRef = collection(firestore, 'pastPapers');
        
        // Get all existing papers to avoid duplicates
        const existingDocs = await getDocs(pastPapersCollectionRef);
        const existingPapers = new Map<string, boolean>();
        
        existingDocs.forEach(doc => {
            const data = doc.data();
            const subject = (data.subject || '').toLowerCase().trim();
            const year = data.year || '';
            // Extract paper number more flexibly
            const paperMatch = subject.match(/(?:paper|p)\s*(\d+)/i);
            const paperNumber = paperMatch ? paperMatch[1] : '';
            // Remove paper number for base subject comparison
            const baseSubject = subject.replace(/\s*(?:paper|p)\s*\d+.*/i, '').trim();
            const grade = data.gradeLevel || 12;
            // Create key with normalized subject
            const key = `${baseSubject}_${year}_${paperNumber}_${grade}`;
            existingPapers.set(key, true);
        });

        const results = {
            total: 0,
            created: 0,
            skipped: 0,
            errors: [] as string[],
        };

        // Iterate through all papers in the question data
        for (const [subject, paperData] of Object.entries(pastPaperQuestionsData)) {
            for (const [paperName, yearData] of Object.entries(paperData)) {
                for (const [yearStr, questions] of Object.entries(yearData)) {
                    results.total++;
                    
                    try {
                        const year = parseInt(yearStr);
                        if (isNaN(year)) continue;
                        
                        // Construct the full subject name with paper number
                        const fullSubjectName = paperName 
                            ? `${subject} ${paperName}`
                            : subject;
                        
                        // Create unique key for duplicate checking (normalize to base subject)
                        const paperMatch = paperName.match(/(\d+)/);
                        const paperNumber = paperMatch ? paperMatch[1] : '';
                        const baseSubject = subject.toLowerCase().trim();
                        const key = `${baseSubject}_${year}_${paperNumber}_12`;
                        
                        // Skip if already exists
                        if (existingPapers.has(key)) {
                            results.skipped++;
                            continue;
                        }
                        
                        // Create the paper document
                        await addDoc(pastPapersCollectionRef, {
                            teacherId: userId,
                            gradeLevel: 12,
                            subject: fullSubjectName,
                            year: year.toString(),
                            paperName: `${subject} ${paperName} ${year}`,
                            memoName: `${subject} ${paperName} ${year} Memo`,
                            status: 'Processed',
                            questionCount: questions.length,
                            generatedQuestions: questions.map(q => ({
                                questionNumber: q.questionNumber,
                                questionText: q.question,
                                marks: q.marks,
                                answer: q.answer,
                                hasImage: q.imageUrl ? true : false,
                            })),
                        });
                        
                        results.created++;
                    } catch (error) {
                        const errorMsg = error instanceof Error ? error.message : String(error);
                        results.errors.push(`${subject} ${paperName} ${yearStr}: ${errorMsg}`);
                    }
                }
            }
        }
        
        return Response.json({
            success: true,
            message: `Synced ${results.created} papers, skipped ${results.skipped} duplicates`,
            ...results,
        });
    } catch (error) {
        console.error('Error syncing past papers:', error);
        return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

