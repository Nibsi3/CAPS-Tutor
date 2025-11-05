/**
 * TEMPORARY: This API route uses Firebase Admin SDK for server-side operations.
 * This will be migrated to Appwrite Server SDK in a future update.
 * Client-side code has been fully migrated to Appwrite.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccount) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount))
      });
    } else {
      initializeApp({
        projectId: "studio-3238820292-69b8f"
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

/**
 * Bulk endpoint to add images to all past papers in Firestore
 */
export async function POST(req: NextRequest) {
  try {
    const db = getFirestore();
    
    console.log('🚀 Starting to add images to all past papers...');
    
    // Get all past papers from Firestore
    const papersSnapshot = await db.collection('pastPapers').get();
    
    if (papersSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: 'No past papers found in Firestore.',
      });
    }
    
    const imagesDir = join(process.cwd(), 'Past Paper Images');
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process each paper
    for (const paperDoc of papersSnapshot.docs) {
      const paperData = paperDoc.data();
      const paperName = paperData?.paperName || paperData?.subject || 'Unknown';
      const paperId = paperDoc.id;
      
      console.log(`📄 Processing: ${paperName}`);
      
      // Check if paper already has images
      const questions = paperData.generatedQuestions || [];
      const hasImagesAlready = questions.some((q: any) => q.imageDataUri);
      
      if (hasImagesAlready) {
        console.log(`   ⏭️  Skipped: Already has images`);
        skipCount++;
        continue;
      }
      
      // Check if paper has questions that need images
      const questionsNeedingImages = questions.filter((q: any) => q.hasImage && !q.imageDataUri);
      
      if (questionsNeedingImages.length === 0) {
        console.log(`   ℹ️  No questions need images (${questions.length} total questions)`);
        skipCount++;
        continue;
      }
      
      console.log(`   📝 Found ${questionsNeedingImages.length} questions needing images`);
      
      // Try to find matching images
      let imageFiles: string[] = [];
      try {
        const allFiles = await readdir(imagesDir, { withFileTypes: true });
        
        const baseName = paperName.replace(/\.pdf$/i, '').trim();
        const searchPattern = baseName.toLowerCase().replace(/\s+/g, ' ');
        
        for (const file of allFiles) {
          const fileName = file.name.toLowerCase();
          
          if (fileName.includes(searchPattern.slice(0, 20)) && !fileName.includes('memo') && !fileName.includes('answer book')) {
            if (file.isDirectory()) {
              const dirFiles = await readdir(join(imagesDir, file.name));
              const jpgFiles = dirFiles.filter(f => f.toLowerCase().endsWith('.jpg')).map(f => join(imagesDir, file.name, f));
              imageFiles.push(...jpgFiles);
            } else if (file.name.toLowerCase().endsWith('.jpg')) {
              imageFiles.push(join(imagesDir, file.name));
            }
          }
        }
        
        imageFiles.sort();
      } catch (error) {
        console.log(`   ❌ Error reading images directory: ${error}`);
      }
      
      if (imageFiles.length === 0) {
        console.log(`   ⚠️  No images found in directory`);
        errorCount++;
        errors.push(`${paperName}: No images found`);
        continue;
      }
      
      console.log(`   🖼️  Found ${imageFiles.length} images`);
      
      // Read and convert images to base64
      const imageDataUris: string[] = [];
      for (const imagePath of imageFiles) {
        try {
          const imageBuffer = await readFile(imagePath);
          const imageBase64 = imageBuffer.toString('base64');
          const imageDataUri = `data:image/jpeg;base64,${imageBase64}`;
          imageDataUris.push(imageDataUri);
        } catch (error) {
          console.log(`   ⚠️  Error reading image ${imagePath}: ${error}`);
        }
      }
      
      if (imageDataUris.length === 0) {
        console.log(`   ⚠️  Could not read any images`);
        errorCount++;
        errors.push(`${paperName}: Could not read images`);
        continue;
      }
      
      // Assign images to questions
      let imagesAssigned = 0;
      const updatedQuestions = questions.map((q: any, index: number) => {
        if (q.hasImage && !q.imageDataUri && imageDataUris[imagesAssigned]) {
          imagesAssigned++;
          return {
            ...q,
            imageDataUri: imageDataUris[imagesAssigned - 1]
          };
        }
        return q;
      });
      
      // Update Firestore
      try {
        const paperRef = db.collection('pastPapers').doc(paperId);
        await paperRef.update({ generatedQuestions: updatedQuestions });
        console.log(`   ✅ Successfully added ${imagesAssigned} images`);
        successCount++;
      } catch (error) {
        console.log(`   ❌ Error updating Firestore: ${error}`);
        errorCount++;
        errors.push(`${paperName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log('\n✨ Process Complete!');
    console.log(`✅ Successfully processed: ${successCount} papers`);
    console.log(`⏭️  Skipped: ${skipCount} papers`);
    console.log(`❌ Errors: ${errorCount} papers`);
    
    return NextResponse.json({
      success: true,
      message: `Added images to ${successCount} papers, skipped ${skipCount}, errors ${errorCount}`,
      results: {
        success: successCount,
        skipped: skipCount,
        errors: errorCount,
      },
      errors: errors,
    });
    
  } catch (error) {
    console.error('Fatal error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}



