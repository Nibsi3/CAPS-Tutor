import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { subjects } from '@/lib/data';

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
 * Helper function to convert collection ID to subject label
 * e.g., "mathematical-literacy" -> "Mathematical Literacy"
 * This handles all subjects by:
 * 1. First trying to match against known subjects
 * 2. If no match, converting hyphenated collection IDs to proper case
 */
function collectionIdToSubjectLabel(collectionId: string): string {
  // Normalize collection ID for matching
  const normalizedId = collectionId.toLowerCase().trim();
  
  // Create a mapping from normalized collection IDs to actual subject labels
  // This handles variations like "mathematical-literacy" -> "Mathematical Literacy"
  const collectionIdToSubjectMap: Record<string, string> = {};
  
  // Build mapping from subjects array
  subjects.forEach(subject => {
    const subjectValue = subject.value.toLowerCase().trim();
    // Create possible collection ID variations
    const variations = [
      subjectValue.replace(/\s+/g, '-'), // "mathematical literacy" -> "mathematical-literacy"
      subjectValue.replace(/\s+/g, ''), // "mathematical literacy" -> "mathematicalliteracy"
    ];
    
    variations.forEach(variation => {
      collectionIdToSubjectMap[variation] = subject.label || subject.value;
    });
  });
  
  // Check if we have a direct match
  if (collectionIdToSubjectMap[normalizedId]) {
    return collectionIdToSubjectMap[normalizedId];
  }
  
  // If no match, convert collection ID to subject label format
  // Split by hyphens, capitalize first letter of each word, join with spaces
  const words = collectionId.split('-');
  
  // Special handling for common acronyms and abbreviations
  const acronyms: Record<string, string> = {
    'cat': 'CAT',
    'it': 'IT',
    'ems': 'EMS',
    'hl': 'HL',
    'fal': 'FAL',
    'ht': 'HT',
    'eat': 'EAT',
    'sal': 'SAL',
  };
  
  const capitalized = words.map(word => {
    const lowerWord = word.toLowerCase();
    
    // Check if it's a known acronym
    if (acronyms[lowerWord]) {
      return acronyms[lowerWord];
    }
    
    // Capitalize first letter, lowercase the rest
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  const converted = capitalized.join(' ');
  
  // Try to find a close match in the subjects list
  const closeMatch = subjects.find(s => {
    const subjectLower = s.value.toLowerCase();
    return subjectLower === converted.toLowerCase() || 
           subjectLower.includes(converted.toLowerCase()) ||
           converted.toLowerCase().includes(subjectLower);
  });
  
  return closeMatch ? (closeMatch.label || closeMatch.value) : converted;
}

/**
 * Helper function to check if a collection is a system collection (not a subject collection)
 */
function isSystemCollection(collectionId: string): boolean {
  const systemCollections = [
    'user',
    'users',
    'userprogress',
    'pastpapers',
    'pastpaperprogress',
    'questions',
    'custompresets',
    'adminid',
    'systemsettings',
    'announcements',
    'contentcontrol',
    'studentprogress',
    'apikeys',
    'activitylogs',
    'photourl',
    'log',
    'logs',
    'settings',
    'system',
    'admin',
  ];
  
  const normalizedId = collectionId.toLowerCase();
  
  // Check exact match
  if (systemCollections.includes(normalizedId)) {
    return true;
  }
  
  // Check for common system collection patterns
  if (
    normalizedId.endsWith('log') ||
    normalizedId.endsWith('logs') ||
    normalizedId.includes('api') ||
    normalizedId.includes('key') ||
    normalizedId.includes('setting') ||
    normalizedId.includes('admin') ||
    normalizedId.includes('system') ||
    normalizedId.includes('photo') ||
    normalizedId.includes('url')
  ) {
    return true;
  }
  
  return false;
}

/**
 * GET /api/admin/custom-presets
 * Get all custom presets for the current user, optionally filtered by type and subject
 * Also automatically includes all questions from all subject collections in the database
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

    // Step 2: Fetch all questions from all subject collections
    let databasePresets: any[] = [];
    
    try {
      // List all collections in the database
      const collectionsResponse = await databases.listCollections(DATABASE_ID);
      const allCollections = collectionsResponse.collections.map((c: any) => c.$id);
      
      // Filter to only subject collections (exclude system collections)
      const subjectCollections = allCollections.filter((collectionId: string) => 
        !isSystemCollection(collectionId)
      );
      
      console.log(`Found ${subjectCollections.length} subject collections: ${subjectCollections.join(', ')}`);
      
      // Fetch questions from all subject collections in parallel
      const collectionPromises = subjectCollections.map(async (collectionId: string) => {
        try {
          const subjectLabel = collectionIdToSubjectLabel(collectionId);
          
          // Apply subject filter early if provided
          if (subject && subjectLabel !== subject) {
            return { collectionId, questions: [] };
          }
          
          // Fetch all questions from this collection using pagination
          // Appwrite has a limit per query (typically 25-100), so we need to paginate
          const allQuestions: any[] = [];
          const limit = 100; // Maximum documents per query in Appwrite
          let offset = 0;
          let hasMore = true;
          let total = 0;
          
          while (hasMore) {
            let batchResponse;
            try {
              // Try with order field first if it exists
              try {
                batchResponse = await databases.listDocuments(
                  DATABASE_ID,
                  collectionId,
                  [
                    Query.orderAsc('order'),
                    Query.limit(limit),
                    Query.offset(offset)
                  ]
                );
              } catch (orderError: any) {
                // If order field doesn't exist, try without ordering
                if (orderError.type === 'general_query_invalid' && orderError.code === 400) {
                  batchResponse = await databases.listDocuments(
                    DATABASE_ID,
                    collectionId,
                    [
                      Query.limit(limit),
                      Query.offset(offset)
                    ]
                  );
                } else {
                  throw orderError;
                }
              }
              
              const batchQuestions = batchResponse.documents || [];
              allQuestions.push(...batchQuestions);
              
              if (total === 0) {
                total = batchResponse.total || 0;
              }
              
              const fetchedCount = batchQuestions.length;
              offset += fetchedCount;
              
              // Continue if we got a full batch and haven't fetched all questions
              hasMore = fetchedCount === limit && allQuestions.length < total;
              
              // Safety check to prevent infinite loops
              if (allQuestions.length >= total && total > 0) {
                hasMore = false;
              }
              
              // Prevent infinite loops (safety limit)
              if (offset > 100000) {
                console.warn(`⚠️ Stopping pagination for ${collectionId} at ${offset} documents to prevent infinite loop`);
                hasMore = false;
              }
            } catch (fetchError: any) {
              // If still fails, skip this collection
              console.warn(`Could not fetch from collection ${collectionId}:`, fetchError.message);
              return { collectionId, subjectLabel, questions: [] };
            }
          }
          
          console.log(`✅ Fetched ${allQuestions.length} questions from ${collectionId} collection`);
          
          return {
            collectionId,
            subjectLabel,
            questions: allQuestions,
          };
        } catch (error: any) {
          // Handle collection access errors gracefully
          if (error.code === 404 || error.type === 'collection_not_found') {
            console.warn(`Collection ${collectionId} not found or not accessible. Skipping.`);
          } else {
            console.error(`Error fetching questions from collection ${collectionId}:`, error);
          }
          return { collectionId, subjectLabel: collectionIdToSubjectLabel(collectionId), questions: [] };
        }
      });
      
      const collectionResults = await Promise.all(collectionPromises);

      // Convert all questions to preset format
      databasePresets = collectionResults
        .flatMap(({ collectionId, subjectLabel, questions }) => {
          return questions.map((q: any) => {
            // Get question text from various possible fields
            const questionText = q.question || q.questionText || q.text || q.content || q.body || '';
            
            // Skip if no question text
            if (!questionText || questionText.trim().length === 0) {
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
              id: `question-${collectionId}-${q.$id}`, // Prefix with collection to ensure uniqueness
              userId: 'system-generator', // Mark as system-generated from database
              name: `Question ${q.number || q.$id} - ${subjectLabel}`,
              description: `From ${subjectLabel} database`,
              type: questionType,
              text: questionText,
              marks: q.marks || 0,
              subject: subjectLabel, // Use the proper subject label
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
          });
        })
        .filter((p: any) => p !== null); // Remove null entries

      console.log(`Fetched ${databasePresets.length} questions from ${subjectCollections.length} subject collections for presets`);
    } catch (error: any) {
      console.error('Error fetching questions from subject collections:', error);
      // Continue with custom presets only
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
    
    // Apply pagination only if limit is explicitly set and > 0
    // If limit is 0 (no limit), return all presets
    let paginatedPresets = allPresets;
    if (limit > 0 && (offset > 0 || limit < total)) {
      const start = offset;
      const end = start + limit;
      paginatedPresets = allPresets.slice(start, end);
    }
    
    // Log summary for debugging
    console.log(`📊 Total presets: ${total} (custom: ${customPresets.length}, database: ${databasePresets.length}), returning: ${paginatedPresets.length}`);

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

