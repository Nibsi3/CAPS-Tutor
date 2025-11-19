import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

const COLLECTION_ID = 'systemsettings';
const SETTINGS_DOC_ID = 'subjectAvailability';

function parseAvailability(value: any): Record<string, string[]> {
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return {};
}

export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();

    try {
      const doc = await databases.getDocument(
        appwriteConfig.databaseId,
        COLLECTION_ID,
        SETTINGS_DOC_ID
      );

      return NextResponse.json({
        success: true,
        availability: Object.keys(doc.availability || {}).length
          ? parseAvailability(doc.availability)
          : {},
      });
    } catch (error: any) {
      const errorCode = error?.code || error?.response?.code;
      const errorType = error?.type || error?.response?.type;
      const errorMessage = error?.message || error?.response?.message || 'Unknown error';
      const normalizedMessage = errorMessage.toLowerCase();
      const isCollectionError =
        errorType === 'collection_not_found' ||
        normalizedMessage.includes('collection');
      const isDocumentError =
        errorType === 'document_not_found' ||
        normalizedMessage.includes('document');

      if (isCollectionError) {
        console.error('Subject availability collection not found:', {
          databaseId: appwriteConfig.databaseId,
          collectionId: COLLECTION_ID,
          errorCode,
          errorType,
          errorMessage,
        });
        return NextResponse.json(
          {
            success: false,
            error: `System settings collection "${COLLECTION_ID}" not found in database "${appwriteConfig.databaseId}". Please create the collection (case-sensitive).`,
          },
          { status: 404 }
        );
      }

      console.warn('Subject availability document missing, returning defaults:', {
        errorCode,
        errorType,
        errorMessage,
      });

      // Default availability structure - Full CAPS subjects for Grades 10-12
      const allCAPSSubjects = [
        'Mathematics',
        'Mathematical Literacy',
        'Physical Sciences',
        'Life Sciences',
        'Accounting',
        'Business Studies',
        'Economics',
        'Geography',
        'History',
        'Information Technology',
        'Computer Applications Technology (CAT)',
        'Tourism',
        'Consumer Studies',
        'Hospitality Studies',
        'Engineering Graphics & Design',
        'English Home Language',
        'English First Additional Language',
        'Afrikaans Huistaal',
        'Afrikaans Eerste Addisionele Taal',
      ];
      
      const defaultAvailability: Record<string, string[]> = {
        '10': allCAPSSubjects,
        '11': allCAPSSubjects,
        '12': allCAPSSubjects,
      };

      return NextResponse.json({
        success: true,
        availability: defaultAvailability,
      });
    }
  } catch (error: any) {
    console.error('Error fetching subject availability:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch subject availability' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { availability } = body;

    if (!availability || typeof availability !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Availability object is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    const availabilityPayload =
      typeof availability === 'string' ? availability : JSON.stringify(availability);

    try {
      // Try to update existing document
      await databases.updateDocument(
        appwriteConfig.databaseId,
        COLLECTION_ID,
        SETTINGS_DOC_ID,
        { availability: availabilityPayload }
      );

      return NextResponse.json({
        success: true,
        message: 'Subject availability updated successfully',
      });
    } catch (updateError: any) {
      // If update fails, try to create the document
      // This handles both document not found and collection not found cases
      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          COLLECTION_ID,
          SETTINGS_DOC_ID,
          { availability: availabilityPayload }
        );

        return NextResponse.json({
          success: true,
          message: 'Subject availability created successfully',
        });
      } catch (createError: any) {
        // Both update and create failed
        console.error('Error updating/creating subject availability:', {
          updateError: updateError?.message,
          createError: createError?.message,
          updateCode: updateError?.code,
          createCode: createError?.code,
        });
        
        // Check if it's a collection not found error
        const errorMessage = createError?.message || updateError?.message || 'Failed to update subject availability';
        const isCollectionError = errorMessage.toLowerCase().includes('collection') || 
                                  createError?.code === 404 || 
                                  updateError?.code === 404;
        
        return NextResponse.json(
          {
            success: false,
            error: isCollectionError 
              ? `System settings collection "${COLLECTION_ID}" does not exist. Please create it in Appwrite first.`
              : errorMessage,
          },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Error updating subject availability:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update subject availability' },
      { status: 500 }
    );
  }
}

