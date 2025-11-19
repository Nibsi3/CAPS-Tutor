import { NextRequest, NextResponse } from 'next/server';
import { getServerStorage } from '@/appwrite/storage-server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { ID } from 'appwrite';

// Use existing bucket for profile pictures (or create a separate one if needed)
const PROFILE_PICTURES_BUCKET_ID = '690dafea0021f232399e';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate file type (only images)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit.' },
        { status: 400 }
      );
    }

    const storage = getServerStorage();
    if (!storage) {
      return NextResponse.json(
        { success: false, error: 'Storage not available' },
        { status: 500 }
      );
    }

    // Generate unique file ID for the profile picture
    const fileId = ID.unique();

    // Upload file to Appwrite Storage
    const uploadedFile = await storage.createFile(
      PROFILE_PICTURES_BUCKET_ID,
      fileId,
      file,
      ['read("any")'] // Public read access so the image can be displayed
    );

    // Generate the public URL for the uploaded image
    const photoURL = `${appwriteConfig.endpoint}/storage/buckets/${PROFILE_PICTURES_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${appwriteConfig.projectId}`;

    // Optionally: Delete old profile picture if it exists in Appwrite Storage
    // (This would require tracking the old file ID, which we can add later)

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.$id,
      photoURL,
      fileName: uploadedFile.name,
    });
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload profile picture',
        code: error.code,
        type: error.type,
      },
      { status: 500 }
    );
  }
}

