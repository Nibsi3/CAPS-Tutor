import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let databases;
    try {
      databases = getServerDatabases();
    } catch (initError: any) {
      console.error('Failed to initialize Appwrite client:', initError);
      return NextResponse.json(
        {
          success: false,
          error: initError.message || 'Failed to initialize database connection',
          details: initError.message?.includes('APPWRITE_API_KEY')
            ? 'APPWRITE_API_KEY environment variable is required. Please set it in .env.local and restart the server.'
            : undefined,
        },
        { status: 500 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');
    const targetAudience = searchParams.get('targetAudience');

    try {
      const queries: string[] = [];
      if (active === 'true') {
        queries.push('active.equal(true)');
      }
      // Only filter by targetAudience if the query parameter is provided
      // Note: This query will fail if the attribute doesn't exist, so we catch it
      if (targetAudience) {
        try {
          queries.push(`targetAudience.equal(${targetAudience})`);
        } catch (e) {
          // Attribute doesn't exist, skip this filter
          console.warn('targetAudience attribute not found, skipping filter');
        }
      }
      
      // Try to add ordering, but if it fails (e.g., attribute doesn't exist), continue without it
      try {
        queries.push('orderDesc("$createdAt")');
      } catch (e) {
        console.warn('Could not add orderDesc query, continuing without ordering');
      }

      console.log('Fetching announcements with queries:', queries);
      console.log('Database ID:', appwriteConfig.databaseId);
      console.log('Collection ID: announcements');

      let announcements;
      try {
        // Always pass an array, even if empty
        announcements = await databases.listDocuments(
          appwriteConfig.databaseId,
          'announcements',
          queries
        );
      } catch (queryError: any) {
        // If query fails (e.g., due to missing attribute in orderDesc), try with minimal query
        console.warn('Query failed, trying with minimal query:', queryError?.message);
        const minimalQueries: string[] = [];
        if (active === 'true') {
          minimalQueries.push('active.equal(true)');
        }
        try {
          announcements = await databases.listDocuments(
            appwriteConfig.databaseId,
            'announcements',
            minimalQueries
          );
        } catch (minimalError: any) {
          // Last resort: try with no queries at all
          console.warn('Minimal query also failed, trying with no queries:', minimalError?.message);
          announcements = await databases.listDocuments(
            appwriteConfig.databaseId,
            'announcements',
            []
          );
        }
      }

      console.log(`Found ${announcements.total} total announcements, ${announcements.documents.length} documents returned`);
      if (announcements.documents.length > 0) {
        console.log('First announcement:', JSON.stringify(announcements.documents[0], null, 2));
      }

      // Filter by scheduling on the server side
      const now = new Date();
      const filtered = announcements.documents.filter((ann: any) => {
        // Check scheduled start
        if (ann.scheduledStart) {
          const startDate = new Date(ann.scheduledStart);
          if (now < startDate) {
            return false; // Not started yet
          }
        }
        
        // Check scheduled end
        if (ann.scheduledEnd) {
          const endDate = new Date(ann.scheduledEnd);
          if (now > endDate) {
            return false; // Already ended
          }
        }
        
        return true;
      });

      console.log(`After filtering: ${filtered.length} announcements remain`);

      return NextResponse.json({
        success: true,
        announcements: filtered,
        total: filtered.length,
      });
    } catch (error: any) {
      // Log the actual error to see what's happening
      console.error('Error fetching announcements:', error);
      console.error('Error code:', error?.code);
      console.error('Error type:', error?.type);
      console.error('Error message:', error?.message);
      
      // Check if it's a collection not found error
      const errorCode = error?.code || error?.response?.code;
      const errorType = error?.type || error?.response?.type;
      const errorMessage = error?.message || error?.response?.message || 'Unknown error';
      const normalizedMessage = errorMessage.toLowerCase();
      
      const isCollectionError =
        errorType === 'collection_not_found' ||
        normalizedMessage.includes('collection') ||
        (errorCode === 404 && normalizedMessage.includes('collection'));
      
      if (isCollectionError) {
        console.warn('Collection not found, returning empty array');
        return NextResponse.json({
          success: true,
          announcements: [],
          total: 0,
        });
      }
      
      // For other errors, still return empty array but log it
      console.warn('Query error (might be attribute issue), returning empty array');
      return NextResponse.json({
        success: true,
        announcements: [],
        total: 0,
      });
    }
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      message, 
      priority, 
      active, 
      userId,
      targetAudience,
      scheduledStart,
      scheduledEnd,
    } = body;

    if (!title || !message || !userId) {
      return NextResponse.json(
        { success: false, error: 'Title, message, and userId are required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    try {
      const announcementId = ID.unique();
      const documentData: any = {
        title,
        message,
        priority: priority || 'medium',
        active: active !== undefined ? active : true,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };

      // Add optional fields if provided (only if they have values)
      // Note: These fields may not exist in the collection yet - we'll handle errors gracefully
      if (targetAudience && targetAudience.trim()) {
        documentData.targetAudience = targetAudience;
      }
      if (scheduledStart && scheduledStart.trim()) {
        documentData.scheduledStart = scheduledStart;
      }
      if (scheduledEnd && scheduledEnd.trim()) {
        documentData.scheduledEnd = scheduledEnd;
      }

      console.log('Creating announcement with data:', JSON.stringify(documentData, null, 2));
      
      const createdDocument = await databases.createDocument(
        appwriteConfig.databaseId,
        'announcements',
        announcementId,
        documentData
      );

      console.log('Announcement created successfully:', createdDocument.$id);

      return NextResponse.json({
        success: true,
        announcementId: createdDocument.$id,
        message: 'Announcement created successfully',
      });
    } catch (error: any) {
      const errorCode = error?.code || error?.response?.code;
      const errorType = error?.type || error?.response?.type;
      const errorMessage = error?.message || error?.response?.message || 'Unknown error';
      const normalizedMessage = errorMessage.toLowerCase();

      // Check if it's a collection not found error
      const isCollectionError =
        errorType === 'collection_not_found' ||
        normalizedMessage.includes('collection') ||
        (errorCode === 404 && normalizedMessage.includes('collection'));

      // Check if it's an attribute error (attribute doesn't exist in collection)
      const isAttributeError =
        normalizedMessage.includes('attribute') ||
        normalizedMessage.includes('unknown attribute') ||
        normalizedMessage.includes('invalid attribute');

      if (isCollectionError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Announcements collection does not exist. Please create it in Appwrite first.',
          },
          { status: 500 }
        );
      }

      if (isAttributeError) {
        // Extract which attributes are missing
        const missingAttributes: string[] = [];
        if (targetAudience && !normalizedMessage.includes('targetaudience')) {
          // Check if targetAudience might be the issue
        }
        
        let helpfulMessage = 'One or more attributes do not exist in the announcements collection. ';
        helpfulMessage += 'Please add the following attributes to your Appwrite collection: ';
        
        if (targetAudience) {
          helpfulMessage += 'targetAudience (String, size 50, optional), ';
        }
        if (scheduledStart) {
          helpfulMessage += 'scheduledStart (String, size 255, optional), ';
        }
        if (scheduledEnd) {
          helpfulMessage += 'scheduledEnd (String, size 255, optional). ';
        }
        
        helpfulMessage += 'See docs/ANNOUNCEMENTS_COLLECTION_SETUP.md for details.';
        helpfulMessage += ' Alternatively, create the announcement without scheduling/audience options first.';

        return NextResponse.json(
          {
            success: false,
            error: helpfulMessage,
            details: {
              errorMessage,
              errorCode,
              providedFields: {
                targetAudience: !!targetAudience,
                scheduledStart: !!scheduledStart,
                scheduledEnd: !!scheduledEnd,
              },
            },
          },
          { status: 500 }
        );
      }

      // Generic error
      console.error('Error creating announcement:', error);
      return NextResponse.json(
        {
          success: false,
          error: errorMessage || 'Failed to create announcement. Please check the collection schema.',
          details: {
            errorCode,
            errorType,
            errorMessage,
          },
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { announcementId, ...updates } = body;

    if (!announcementId) {
      return NextResponse.json(
        { success: false, error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();
    await databases.updateDocument(
      appwriteConfig.databaseId,
      'announcements',
      announcementId,
      updates
    );

    return NextResponse.json({
      success: true,
      message: 'Announcement updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const announcementId = searchParams.get('announcementId');
    
    const databases = getServerDatabases();

    // Check if this is a bulk delete request (body contains array of IDs)
    // Try to read body, but don't fail if it's not available
    let body: any = null;
    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await request.json();
      }
    } catch {
      // Body not available or not JSON, continue with query param approach
    }

    // If body contains announcementIds array, perform bulk delete
    if (body && Array.isArray(body.announcementIds)) {
      const announcementIds = body.announcementIds;
      
      if (announcementIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No announcement IDs provided' },
          { status: 400 }
        );
      }

      const deletePromises = announcementIds.map((id: string) =>
        databases.deleteDocument(
          appwriteConfig.databaseId,
          'announcements',
          id
        ).catch((error: any) => {
          console.error(`Error deleting announcement ${id}:`, error);
          return { id, error: error.message };
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${successful} announcement(s)${failed > 0 ? `, ${failed} failed` : ''}`,
        deleted: successful,
        failed,
      });
    }

    // Single delete (backward compatibility with query param)
    if (!announcementId) {
      return NextResponse.json(
        { success: false, error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      'announcements',
      announcementId
    );

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}

