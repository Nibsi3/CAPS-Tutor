import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'node-appwrite';

/**
 * DELETE /api/admin/past-papers-v2/delete
 * Deletes a past paper and all associated questions
 * Uses server-side credentials to avoid permission issues
 */
export async function DELETE(request: NextRequest) {
  try {
    const { paperId } = await request.json();

    if (!paperId) {
      return NextResponse.json(
        { success: false, error: 'Paper ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    // Fetch all questions in batches (Appwrite default limit is 25, max is 100)
    const FETCH_BATCH_SIZE = 100;
    const DELETE_BATCH_SIZE = 10;
    let offset = 0;
    let hasMore = true;
    let deletedQuestions = 0;
    let failedQuestions = 0;

    while (hasMore) {
      // Get questions for this paper in batches
      const questionsResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        'questions',
        [
          Query.equal('paperId', paperId),
          Query.limit(FETCH_BATCH_SIZE),
          Query.offset(offset)
        ]
      );

      const questions = questionsResponse.documents;
      const totalQuestions = questionsResponse.total;

      // Delete questions in smaller batches to avoid rate limits
      for (let i = 0; i < questions.length; i += DELETE_BATCH_SIZE) {
        const batch = questions.slice(i, i + DELETE_BATCH_SIZE);
        
        const batchPromises = batch.map(async (question) => {
          try {
            await databases.deleteDocument(
              appwriteConfig.databaseId,
              'questions',
              question.$id
            );
            deletedQuestions++;
          } catch (error: any) {
            console.error(`Failed to delete question ${question.$id}:`, error);
            failedQuestions++;
            // Continue with other questions even if one fails
          }
        });

        await Promise.all(batchPromises);

        // Add a small delay between batches to avoid rate limiting
        if (i + DELETE_BATCH_SIZE < questions.length) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        }
      }

      // Check if there are more questions to fetch
      offset += questions.length;
      hasMore = questions.length === FETCH_BATCH_SIZE && deletedQuestions + failedQuestions < totalQuestions;
    }

    // Delete the paper itself
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      'pastpapers',
      paperId
    );

    return NextResponse.json({
      success: true,
      message: `Deleted paper and ${deletedQuestions} questions`,
      deletedQuestions,
      failedQuestions,
    });
  } catch (error: any) {
    console.error('Error deleting paper:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete paper',
        code: error.code,
        type: error.type,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/past-papers-v2/delete
 * Bulk delete multiple papers and their questions
 */
export async function POST(request: NextRequest) {
  try {
    const { paperIds } = await request.json();

    if (!paperIds || !Array.isArray(paperIds) || paperIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Paper IDs array is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();
    const results = {
      success: [] as string[],
      failed: [] as Array<{ paperId: string; error: string }>,
      totalQuestionsDeleted: 0,
    };

    // Process papers one at a time to avoid rate limits
    for (const paperId of paperIds) {
      try {
        // Fetch all questions in batches (Appwrite default limit is 25, max is 100)
        const FETCH_BATCH_SIZE = 100;
        const DELETE_BATCH_SIZE = 10;
        let offset = 0;
        let hasMore = true;
        let deletedQuestions = 0;

        while (hasMore) {
          // Get questions for this paper in batches
          const questionsResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            'questions',
            [
              Query.equal('paperId', paperId),
              Query.limit(FETCH_BATCH_SIZE),
              Query.offset(offset)
            ]
          );

          const questions = questionsResponse.documents;
          const totalQuestions = questionsResponse.total;

          // Delete questions in smaller batches to avoid rate limits
          for (let i = 0; i < questions.length; i += DELETE_BATCH_SIZE) {
            const batch = questions.slice(i, i + DELETE_BATCH_SIZE);
            
            const batchPromises = batch.map(async (question) => {
              try {
                await databases.deleteDocument(
                  appwriteConfig.databaseId,
                  'questions',
                  question.$id
                );
                deletedQuestions++;
              } catch (error: any) {
                console.error(`Failed to delete question ${question.$id}:`, error);
                // Continue with other questions
              }
            });

            await Promise.all(batchPromises);

            // Add delay between batches
            if (i + DELETE_BATCH_SIZE < questions.length) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }

          // Check if there are more questions to fetch
          offset += questions.length;
          hasMore = questions.length === FETCH_BATCH_SIZE && deletedQuestions < totalQuestions;
        }

        // Delete the paper
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          'pastpapers',
          paperId
        );

        results.success.push(paperId);
        results.totalQuestionsDeleted += deletedQuestions;

        // Add delay between papers to avoid rate limiting
        if (paperIds.indexOf(paperId) < paperIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between papers
        }
      } catch (error: any) {
        console.error(`Failed to delete paper ${paperId}:`, error);
        results.failed.push({
          paperId,
          error: error.message || 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${results.success.length} paper(s) and ${results.totalQuestionsDeleted} questions`,
      results,
    });
  } catch (error: any) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete papers',
      },
      { status: 500 }
    );
  }
}

