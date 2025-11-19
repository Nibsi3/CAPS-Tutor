import { NextRequest, NextResponse } from 'next/server';
import { getServerStorage, ID } from '@/lib/appwrite-server';

const QUESTION_IMAGES_BUCKET_ID = '690dafea0021f232399e';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const { id: paperId } = await params;
    const questionId = formData.get('questionId') as string;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'Image file is required' },
        { status: 400 }
      );
    }

    const storage = getServerStorage();
    const fileId = ID.unique();

    // Convert File to native File object (Node.js 18+)
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileObject = new File([buffer], imageFile.name, {
      type: imageFile.type || 'image/png',
      lastModified: Date.now(),
    });

    await storage.createFile(
      QUESTION_IMAGES_BUCKET_ID,
      fileId,
      fileObject,
      ['read("users")'] // Accessible to authenticated users
    );

    return NextResponse.json({
      success: true,
      fileId,
      message: 'Image uploaded successfully',
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

