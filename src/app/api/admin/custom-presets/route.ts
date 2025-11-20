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
 * Also automatically includes all questions from the questions collection
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
    
    // Step 1: Fetch custom presets
    let customPresets: any[] = [];
    let customPresetsTotal = 0;
    
    try {
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

      // Get all custom presets (no limit for merging)
      const customResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        baseQueries
      );
      
      customPresets = customResponse.documents.map(doc => ({
        id: doc.$id,
        userId: doc.userId,
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
      }));
      
      customPresetsTotal = customResponse.total;
    } catch (error: any) {
      // Handle collection not found gracefully - just continue without custom presets
      if (error.code === 404 || error.type === 'collection_not_found') {
        console.warn('Custom presets collection does not exist yet. Continuing with database questions only.');
      } else {
        console.error('Error fetching custom presets:', error);
        // Continue anyway to fetch questions from database
      }
    }

    // Step 2: Fetch all questions from the questions collection
    let databasePresets: any[] = [];
    
    try {
      // Fetch all questions from the database
      const questionsQuery: string[] = [Query.orderAsc('order')];
      
      // Apply subject filter if provided (will filter after getting paper info)
      
      const questionsResponse = await databases.listDocuments(
        DATABASE_ID,
        'questions',
        questionsQuery
      );

      // Get all unique paperIds
      const paperIds = [...new Set(questionsResponse.documents.map((q: any) => q.paperId).filter(Boolean))];
      
      // Fetch all papers to get subject information
      const paperMap = new Map<string, any>();
      
      if (paperIds.length > 0) {
        // Fetch papers individually (Appwrite doesn't support OR queries with multiple $id values efficiently)
        // Use Promise.all for parallel fetching to improve performance
        const paperPromises = paperIds.map(async (paperId) => {
          try {
            const paper = await databases.getDocument(
              DATABASE_ID,
              'pastpapers',
              paperId
            );
            return { id: paper.$id, paper };
          } catch (err: any) {
            console.warn(`Could not fetch paper ${paperId}:`, err.message);
            return null;
          }
        });
        
        const paperResults = await Promise.all(paperPromises);
        
        paperResults.forEach((result) => {
          if (result) {
            paperMap.set(result.id, result.paper);
          }
        });
      }

      // Convert questions to preset format
      databasePresets = questionsResponse.documents
        .map((q: any) => {
          const paper = paperMap.get(q.paperId);
          const questionSubject = paper?.subject || q.subject || 'Unknown';
          
          // Get question text from various possible fields
          const questionText = q.question || q.questionText || q.text || q.content || q.body || '';
          
          // Skip if no question text
          if (!questionText || questionText.trim().length === 0) {
            return null;
          }

          // Apply subject filter if provided
          if (subject && questionSubject !== subject) {
            return null;
          }

          // Apply type filter if provided
          if (type && q.type !== type) {
            return null;
          }

          // Determine question type from database or infer from options
          let questionType = q.type || 'short-answer';
          if (q.options && Array.isArray(q.options) && q.options.length > 0) {
            questionType = 'multiple-choice';
          } else if (q.tableData || q.tableSubject) {
            questionType = 'table-interpretation';
          } else if (q.graphData || q.graphSubject) {
            questionType = 'graph-interpretation';
          } else if (q.extractText || q.extract) {
            questionType = 'extract-source';
          } else if (q.hasImage || q.imageFileId) {
            questionType = q.type || 'diagram-interpretation';
          }

          // Convert to preset format
          const preset: any = {
            id: `question-${q.$id}`, // Prefix to distinguish from custom presets
            userId: 'system-generator', // Mark as system-generated from database
            name: `Question ${q.number || q.$id}${paper ? ` - ${paper.subject}` : ''}`,
            description: `From past paper database${paper ? ` (${paper.year || ''})` : ''}`,
            type: questionType,
            text: questionText,
            marks: q.marks || 0,
            subject: questionSubject,
            instructionText: q.instructionText || q.instruction || '',
            answer: q.answer || '',
            hasDiagram: q.hasImage || !!q.imageFileId || false,
            diagramLabel: q.imageLabel || q.diagramLabel || '',
            createdAt: q.$createdAt || '',
            updatedAt: q.$updatedAt || '',
          };

          // Add optional fields if they exist
          if (q.options && Array.isArray(q.options) && q.options.length > 0) {
            preset.options = q.options;
          }

          if (q.tableData) {
            try {
              preset.tableData = typeof q.tableData === 'string' ? JSON.parse(q.tableData) : q.tableData;
            } catch (e) {
              // If parsing fails, skip tableData
            }
          }

          if (q.graphData) {
            try {
              preset.graphData = typeof q.graphData === 'string' ? JSON.parse(q.graphData) : q.graphData;
            } catch (e) {
              // If parsing fails, skip graphData
            }
          }

          if (q.extractText || q.extract) {
            preset.extractText = q.extractText || q.extract || '';
          }

          return preset;
        })
        .filter((p: any) => p !== null); // Remove null entries

      console.log(`Fetched ${databasePresets.length} questions from database for presets`);
    } catch (error: any) {
      // Handle questions collection not found gracefully
      if (error.code === 404 || error.type === 'collection_not_found') {
        console.warn('Questions collection does not exist yet. Continuing with custom presets only.');
      } else {
        console.error('Error fetching questions from database:', error);
        // Continue with custom presets only
      }
    }

    // Step 3: Combine custom presets and database presets
    const allPresets = [...customPresets, ...databasePresets];
    
    // Sort by creation date (newest first), but keep custom presets prioritized
    allPresets.sort((a, b) => {
      // Custom presets come first
      const aIsCustom = !a.id?.startsWith('question-');
      const bIsCustom = !b.id?.startsWith('question-');
      
      if (aIsCustom && !bIsCustom) return -1;
      if (!aIsCustom && bIsCustom) return 1;
      
      // Then sort by date
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

    const total = allPresets.length;
    
    // Apply pagination
    let paginatedPresets = allPresets;
    if (offset > 0 || (limit > 0 && limit < total)) {
      const start = offset;
      const end = limit > 0 ? start + limit : undefined;
      paginatedPresets = allPresets.slice(start, end);
    }

    return NextResponse.json({
      success: true,
      presets: paginatedPresets,
      total,
    });
  } catch (error: any) {
    console.error('Error fetching presets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch presets' },
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

