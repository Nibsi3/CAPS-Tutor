import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

const DATABASE_ID = appwriteConfig.databaseId;
const COLLECTION_ID = 'custompresets'; // Collection ID in Appwrite (lowercase)

export interface CustomPreset {
  $id?: string;
  userId: string;
  name: string;
  description: string;
  type: string; // QuestionType
  text: string;
  marks: number;
  subject?: string;
  instructionText?: string;
  options?: string[]; // For multiple choice
  tableData?: { headers: string[]; rows: string[][]; description?: string }; // For tables
  graphData?: {
    type?: string;
    description?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    y2AxisLabel?: string;
    dataPoints?: Array<{ label: string; value: string | number; value2?: string | number; category?: string }>;
    showLegend?: boolean;
    showGrid?: boolean;
  }; // For graphs
  extractText?: string; // For extracts
  diagramLabel?: string;
  hasDiagram?: boolean;
  answer?: string; // Optional answer
  createdAt?: string;
  updatedAt?: string;
}

/**
 * GET /api/admin/custom-presets
 * Get all custom presets for the current user, optionally filtered by type and subject
 * Supports pagination with limit and offset
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const subject = searchParams.get('subject');
    const limit = parseInt(searchParams.get('limit') || '0'); // 0 means no limit
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();
    // Get both user's presets and system-generated presets (available to everyone)
    const baseQueries: string[] = [
      Query.or([
        Query.equal('userId', userId),
        Query.equal('userId', 'system-generator'), // System presets available to all
      ])
    ];
    
    if (type) {
      baseQueries.push(Query.equal('type', type));
    }
    
    if (subject) {
      baseQueries.push(Query.equal('subject', subject));
    }

    baseQueries.push(Query.orderDesc('$createdAt'));

    // First, get total count (without limit/offset)
    const countQueries = [...baseQueries];
    const countResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      countQueries
    );
    const total = countResponse.total;

    // Then get the actual data with pagination if limit is specified
    const dataQueries = [...baseQueries];
    if (limit > 0) {
      dataQueries.push(Query.limit(limit));
    }
    if (offset > 0) {
      dataQueries.push(Query.offset(offset));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      dataQueries
    );

    return NextResponse.json({
      success: true,
      presets: response.documents.map(doc => ({
        id: doc.$id,
        userId: doc.userId, // Include userId to distinguish system presets
        name: doc.name,
        description: doc.description,
        type: doc.type,
        text: doc.text,
        marks: doc.marks,
        subject: doc.subject,
        instructionText: doc.instructionText,
        options: doc.options,
        tableData: doc.tableData,
        graphData: doc.graphData,
        extractText: doc.extractText,
        diagramLabel: doc.diagramLabel,
        hasDiagram: doc.hasDiagram,
        answer: doc.answer,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      })),
      total,
    });
  } catch (error: any) {
    // Handle collection not found gracefully
    if (error.code === 404 || error.type === 'collection_not_found') {
      console.warn('Custom presets collection does not exist yet. Returning empty array.');
      return NextResponse.json({
        success: true,
        presets: [],
        total: 0,
        message: 'Custom presets collection does not exist. Create it in Appwrite to start saving presets.',
      });
    }
    
    console.error('Error fetching custom presets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch custom presets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/custom-presets
 * Create a new custom preset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      description,
      type,
      text,
      marks,
      subject,
      instructionText,
      options,
      tableData,
      graphData,
      extractText,
      diagramLabel,
      hasDiagram,
      answer,
    } = body;

    // Validation
    if (!userId || !name || !type || !text || marks === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, type, text, marks' },
        { status: 400 }
      );
    }

    const presetData: any = {
      userId,
      name,
      description: description || '',
      type,
      text,
      marks: Number(marks),
    };

    // Optional fields
    if (subject) presetData.subject = subject;
    if (instructionText) presetData.instructionText = instructionText;
    if (options) presetData.options = options;
    if (tableData) presetData.tableData = tableData;
    if (graphData) presetData.graphData = graphData;
    if (extractText) presetData.extractText = extractText;
    if (diagramLabel) presetData.diagramLabel = diagramLabel;
    if (hasDiagram !== undefined) presetData.hasDiagram = hasDiagram;
    if (answer) presetData.answer = answer;

    const databases = getServerDatabases();
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      presetData
    );

    return NextResponse.json({
      success: true,
      preset: {
        id: response.$id,
        ...presetData,
        createdAt: response.$createdAt,
        updatedAt: response.$updatedAt,
      },
    });
  } catch (error: any) {
    // Handle collection not found
    if (error.code === 404 || error.type === 'collection_not_found') {
      return NextResponse.json(
        { 
          error: 'Custom presets collection does not exist. Please create the collection in Appwrite first.',
          code: 'COLLECTION_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    console.error('Error creating custom preset:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create custom preset' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/custom-presets
 * Update an existing custom preset
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { presetId, ...updates } = body;

    if (!presetId) {
      return NextResponse.json(
        { error: 'Preset ID is required' },
        { status: 400 }
      );
    }

    // Convert marks to number if present
    if (updates.marks !== undefined) {
      updates.marks = Number(updates.marks);
    }

    const databases = getServerDatabases();
    const response = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      presetId,
      updates
    );

    return NextResponse.json({
      success: true,
      preset: {
        id: response.$id,
        ...updates,
        updatedAt: response.$updatedAt,
      },
    });
  } catch (error: any) {
    // Handle collection not found
    if (error.code === 404 || error.type === 'collection_not_found') {
      return NextResponse.json(
        { 
          error: 'Custom presets collection does not exist. Please create the collection in Appwrite first.',
          code: 'COLLECTION_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    console.error('Error updating custom preset:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update custom preset' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/custom-presets
 * Delete a custom preset
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const presetId = searchParams.get('presetId');

    if (!presetId) {
      return NextResponse.json(
        { error: 'Preset ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();
    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, presetId);

    return NextResponse.json({
      success: true,
      message: 'Preset deleted successfully',
    });
  } catch (error: any) {
    // Handle collection not found
    if (error.code === 404 || error.type === 'collection_not_found') {
      return NextResponse.json(
        { 
          error: 'Custom presets collection does not exist. Please create the collection in Appwrite first.',
          code: 'COLLECTION_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    console.error('Error deleting custom preset:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete custom preset' },
      { status: 500 }
    );
  }
}

