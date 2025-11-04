import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    // Try to use service account from environment variable
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccount) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount))
      });
    } else {
      // Fallback to default credentials
      initializeApp({
        projectId: "studio-3238820292-69b8f"
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { paperId } = await req.json();
    
    if (!paperId) {
      return NextResponse.json(
        { error: 'paperId is required' },
        { status: 400 }
      );
    }
    
    const db = getFirestore();
    const paperRef = db.collection('pastPapers').doc(paperId);
    const paperDoc = await paperRef.get();
    
    if (!paperDoc.exists) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }
    
    const paperData = paperDoc.data();
    
    // Check if this is Dance Studies Nov 2020 Eng
    if (!paperData?.paperName?.includes('Dance Studies Nov 2020 Eng')) {
      return NextResponse.json(
        { error: 'This endpoint only supports Dance Studies Nov 2020 Eng for now' },
        { status: 400 }
      );
    }
    
    // Read the image files
    const image1Path = join(process.cwd(), 'Past Paper Images', 'Dance Studies Nov 2020 Eng-0001.jpg');
    const image2Path = join(process.cwd(), 'Past Paper Images', 'Dance Studies Nov 2020 Eng-0002.jpg');
    
    const image1Buffer = await readFile(image1Path);
    const image2Buffer = await readFile(image2Path);
    
    const image1Base64 = image1Buffer.toString('base64');
    const image2Base64 = image2Buffer.toString('base64');
    
    const image1DataUri = `data:image/jpeg;base64,${image1Base64}`;
    const image2DataUri = `data:image/jpeg;base64,${image2Base64}`;
    
    // Update questions with images
    const questions = paperData.generatedQuestions || [];
    const updatedQuestions = questions.map((q: any, index: number) => {
      if (index === 0) {
        return {
          ...q,
          hasImage: true,
          imageDataUri: image1DataUri
        };
      } else if (index === 1) {
        return {
          ...q,
          hasImage: true,
          imageDataUri: image2DataUri
        };
      }
      return q;
    });
    
    // Update Firestore
    await paperRef.update({ generatedQuestions: updatedQuestions });
    
    return NextResponse.json({
      success: true,
      message: `Added images to ${updatedQuestions.length} questions`,
      imagesAdded: 2
    });
    
  } catch (error) {
    console.error('Error adding images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

