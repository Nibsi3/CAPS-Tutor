export async function POST(request: Request) {
    try {
        const { userId } = await request.json();
        
        if (!userId) {
            return Response.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Past paper questions have been removed
        // This endpoint now returns empty results
        
        return Response.json({
            success: true,
            message: 'No past paper questions to sync (all questions have been removed)',
            total: 0,
            created: 0,
            skipped: 0,
            errors: [],
        });
    } catch (error) {
        console.error('Error syncing past papers:', error);
        return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

