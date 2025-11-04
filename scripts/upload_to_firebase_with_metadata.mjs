/**
 * Action 3: Upload to Firebase
 * Uploads structured questions to Firestore
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc, getDocs, getDoc, query, where, collectionGroup } from 'firebase/firestore';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const EXTRACTED_FOLDER = join(ROOT_DIR, 'extracted_papers');

// Firebase config - read from environment or use default
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "***REMOVED***",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-3238820292-69b8f.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-3238820292-69b8f",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:709416001139:web:e5ede79f65173ca0069406",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "709416001139"
};

// Initialize Firebase
let app;
let db;

async function initFirebase() {
    if (!getApps().length) {
        try {
            app = initializeApp();
        } catch (e) {
            // Use hardcoded config (can't import TypeScript files in Node.js)
            app = initializeApp(firebaseConfig);
        }
    } else {
        app = getApps()[0];
    }
    
    db = getFirestore(app);
    return db;
}

/**
 * Upload a paper's questions to Firestore
 */
async function uploadPaper(paperJson, pdfMetadata = null) {
    const { subject, year, paper, questions } = paperJson;
    
    // Format: "Life Sciences Paper 1" (full subject with paper number)
    const fullSubject = `${subject} ${paper}`;
    
    console.log(`  Looking for: ${fullSubject} (${year})`);
    
    // Get extracted images with data URIs from the PDF metadata
    let extractedImages = [];
    if (pdfMetadata && pdfMetadata.json) {
        try {
            const jsonContent = JSON.parse(readFileSync(pdfMetadata.json, 'utf-8'));
            extractedImages = jsonContent.pages
                .flatMap(page => page.images || [])
                .filter(img => img && typeof img === 'object' && img.dataUri)
                .map(img => img.dataUri);
            console.log(`  Found ${extractedImages.length} extracted image(s) with data URIs`);
        } catch (e) {
            console.log(`  Warning: Could not load extracted images: ${e.message}`);
        }
    }
    
    // Helper function to validate data URI
    function isValidDataUri(str) {
        if (!str || typeof str !== 'string') return false;
        return str.startsWith('data:image/') || str.startsWith('data:application/pdf');
    }
    
    // Match images to questions if needed
    // Get extracted images with full metadata (dataUri, label, rect) from PDF
    let extractedImagesFull = [];
    if (pdfMetadata && pdfMetadata.json) {
        try {
            const jsonContent = JSON.parse(readFileSync(pdfMetadata.json, 'utf-8'));
            extractedImagesFull = jsonContent.pages
                .flatMap(page => page.images || [])
                .filter(img => img && typeof img === 'object' && img.dataUri)
                .map(img => ({
                    dataUri: img.dataUri,
                    label: img.label || null,
                    rect: img.rect || null
                }));
            console.log(`  Found ${extractedImagesFull.length} extracted image(s) with full metadata`);
        } catch (e) {
            console.log(`  Warning: Could not load extracted images: ${e.message}`);
        }
    }
    
    // Process questions to match new format (number, type, question, image, image_label)
    let imageIndex = 0;
    const processedQuestions = questions.map(q => {
        // Handle both old and new formats
        const questionNumber = q.number || q.questionNumber || '';
        const questionText = q.question || q.questionText || '';
        const questionType = q.type || (q.hasImage ? 'diagram' : 'short');
        let image = q.image || q.imageDataUri || null;
        let imageLabel = q.image_label || q.imageLabel || null;
        
        // Validate image data URI
        if (image && !isValidDataUri(image)) {
            console.log(`  Warning: Invalid image for question ${questionNumber}, clearing it`);
            image = null;
        }
        
        // If question has image type but no image, try to assign from extracted images
        if ((questionType === 'diagram' || q.hasImage) && !image && extractedImagesFull.length > 0 && imageIndex < extractedImagesFull.length) {
            const candidateImage = extractedImagesFull[imageIndex];
            if (isValidDataUri(candidateImage.dataUri)) {
                image = candidateImage.dataUri;
                imageLabel = candidateImage.label || imageLabel;
                imageIndex++;
            } else {
                imageIndex++; // Skip invalid image
            }
        }
        
        return {
            number: questionNumber,
            type: questionType,
            question: questionText,
            options: q.options || null,
            answer: q.answer || null,
            image: image,
            image_label: imageLabel
        };
    });
    
    // Create paper ID using format: "{subject}-{year}-{paper}"
    // Format subject to be URL-safe (replace spaces with hyphens, remove special chars)
    const safeSubject = fullSubject.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    const yearStr = year.toString();
    const safePaper = (paperJson.paper || paper).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    const paperId = `${safeSubject}-${yearStr}-${safePaper}`;
    
    // Check if paper already exists using the paperId as document ID
    const paperRef = doc(db, 'pastpapers', paperId);
    
    // Try to get existing document to check if it exists
    const existingDoc = await getDoc(paperRef);
    const paperExists = existingDoc.exists();
    
    if (paperExists) {
        console.log(`  Found existing paper: ${paperId}`);
    } else {
        // Create new paper document
        console.log(`  Creating new paper document: ${paperId}`);
        await setDoc(paperRef, {
            subject: fullSubject,
            grade: paperJson.grade || 12,
            paper: paperJson.paper || paper,
            year: yearStr,
            questionCount: 0,
            status: 'Processing',
            createdAt: new Date().toISOString()
        });
        console.log(`  Created new paper: ${paperId}`);
    }
    
    // Upload each question to subcollection
    // Structure: pastpapers/{paperId}/questions/{number}
    let uploadedCount = 0;
    
    console.log(`  Uploading ${processedQuestions.length} questions to pastpapers/${paperId}/questions...`);
    
    for (const q of processedQuestions) {
        // Sanitize question number for use as document ID (Firestore doesn't allow certain chars)
        const safeQuestionNumber = q.number.replace(/[\/\\\[\]{}]/g, '-').replace(/\./g, '_');
        
        // Use question number as document ID in questions subcollection
        const questionDocRef = doc(db, 'pastpapers', paperId, 'questions', safeQuestionNumber);
        
        await setDoc(questionDocRef, {
            number: q.number,  // Store original number in the document
            type: q.type,
            question: q.question,
            options: q.options || null,
            answer: q.answer || null,
            image: q.image || null,
            image_label: q.image_label || null
        });
        
        uploadedCount++;
    }
    
    // Update paper document with question count and status
    await setDoc(paperRef, {
        questionCount: uploadedCount,
        status: 'Processed',
        uploadedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`  ✓ Uploaded ${uploadedCount} questions to pastpapers/${paperId}/questions`);
    
    return {
        paperId,
        questionCount: uploadedCount
    };
}

/**
 * Main function to upload all processed papers
 */
async function main() {
    // Initialize Firebase first
    await initFirebase();
    
    const questionsSummaryPath = join(EXTRACTED_FOLDER, 'questions_summary.json');
    
    if (!existsSync(questionsSummaryPath)) {
        console.error(`Error: Questions summary not found at ${questionsSummaryPath}`);
        console.error('Please run generate_questions_with_metadata.mjs first');
        process.exit(1);
    }

    const allPdfs = JSON.parse(readFileSync(questionsSummaryPath, 'utf-8'));
    
    // Filter to only those with AI output
    const papersWithQuestions = allPdfs.filter(pdf => pdf.ai_output && pdf.ai_output.questions);
    
    if (papersWithQuestions.length === 0) {
        console.error('No papers with AI-generated questions found');
        process.exit(1);
    }
    
    console.log(`Found ${papersWithQuestions.length} paper(s) to upload\n`);

    const results = [];
    
    for (let i = 0; i < papersWithQuestions.length; i++) {
        const pdf = papersWithQuestions[i];
        const paperJson = pdf.ai_output;
        
        console.log(`[${i + 1}/${papersWithQuestions.length}] Uploading: ${pdf.pdf}`);
        console.log(`  ${paperJson.subject} ${paperJson.paper} ${paperJson.year}`);
        
        try {
            const result = await uploadPaper(paperJson, pdf);
            results.push({
                pdf: pdf.pdf,
                ...result,
                status: 'success'
            });
            
            console.log(`  ✓ Uploaded ${result.questionCount} questions\n`);
        } catch (error) {
            console.error(`  ✗ Error: ${error.message}\n`);
            results.push({
                pdf: pdf.pdf,
                status: 'failed',
                error: error.message
            });
            continue;
        }
    }

    // Save upload results
    const resultsPath = join(EXTRACTED_FOLDER, 'upload_results.json');
    writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf-8');
    
    const successCount = results.filter(r => r.status === 'success').length;
    const totalQuestions = results
        .filter(r => r.status === 'success')
        .reduce((sum, r) => sum + (r.questionCount || 0), 0);
    
    console.log(`\n✓ Upload Summary:`);
    console.log(`  Successfully uploaded: ${successCount}/${results.length} papers`);
    console.log(`  Total questions uploaded: ${totalQuestions}`);
    console.log(`  Results saved to: ${resultsPath}`);
    
    return results;
}

// Run main when executed directly
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

export { uploadPaper, main };

