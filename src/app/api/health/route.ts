// Simple health check endpoint that doesn't require Appwrite
// Useful for verifying server is running and debugging

import { NextResponse } from 'next/server';

export async function GET() {
  // Test Appwrite server connection
  let serverConnectionTest = 'not tested';
  try {
    const { getServerDatabases } = await import('@/lib/appwrite-server');
    const databases = getServerDatabases();
    // Try a simple operation to test connection
    serverConnectionTest = 'connected';
  } catch (error: any) {
    serverConnectionTest = `error: ${error.message}`;
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    // Include Appwrite config status (without sensitive data)
    appwriteConfigured: {
      endpoint: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      databaseId: !!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      serverApiKey: !!process.env.APPWRITE_API_KEY,
    },
    serverConnectionTest,
  });
}

