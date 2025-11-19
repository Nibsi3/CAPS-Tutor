// Simple health check endpoint that doesn't require Appwrite
// Useful for verifying server is running and debugging

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Check if environment variables are available (don't try to use them)
  const hasEndpoint = !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const hasProjectId = !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const hasDatabaseId = !!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const hasApiKey = !!process.env.APPWRITE_API_KEY;
  
  // Test Appwrite server connection only if API key is available
  let serverConnectionTest = 'not tested - API key not available';
  if (hasApiKey) {
    try {
      const { getServerDatabases } = await import('@/lib/appwrite-server');
      const databases = getServerDatabases();
      if (databases) {
        serverConnectionTest = 'connected';
      } else {
        serverConnectionTest = 'failed - getServerDatabases returned null';
      }
    } catch (error: any) {
      serverConnectionTest = `error: ${error.message}`;
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    // Include Appwrite config status (without sensitive data)
    appwriteConfigured: {
      endpoint: hasEndpoint,
      projectId: hasProjectId,
      databaseId: hasDatabaseId,
      serverApiKey: hasApiKey,
    },
    serverConnectionTest,
    note: hasApiKey 
      ? 'All environment variables are set. Server connection test attempted.'
      : 'APPWRITE_API_KEY is not available. Server connection test skipped. For Appwrite Cloud Sites, ensure APPWRITE_API_KEY is set in deployment settings (not just project settings) and the site is redeployed.',
  });
}

