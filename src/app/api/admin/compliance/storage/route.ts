import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, getServerStorage } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();
    const storage = getServerStorage();

    // Get storage usage (this is a placeholder - actual storage stats depend on Appwrite Cloud plan)
    // For now, we'll estimate based on collections
    const collections = await databases.listCollections(appwriteConfig.databaseId);

    // Get file counts from storage buckets
    let totalFiles = 0;
    let totalFileSize = 0;

    try {
      const buckets = await storage.listBuckets();
      for (const bucket of buckets.buckets) {
        try {
          const files = await storage.listFiles(bucket.$id);
          totalFiles += files.files.length;
          // Estimate file sizes (Appwrite doesn't provide exact size without reading each file)
          totalFileSize += files.files.length * 1024 * 1024; // Rough estimate: 1MB per file
        } catch (error) {
          // Bucket might not be accessible
          console.warn(`Could not access bucket ${bucket.$id}:`, error);
        }
      }
    } catch (error) {
      console.warn('Could not access storage:', error);
    }

    // Estimate database size (rough calculation)
    let totalDocuments = 0;
    for (const collection of collections.collections) {
      try {
        const docs = await databases.listDocuments(
          appwriteConfig.databaseId,
          collection.$id,
          []
        );
        totalDocuments += docs.total;
      } catch (error) {
        // Collection might not be accessible
      }
    }

    // Rough estimate: 1KB per document
    const estimatedDatabaseSize = totalDocuments * 1024;

    const totalStorage = totalFileSize + estimatedDatabaseSize;
    const usedStorage = totalStorage; // For now, we don't have a limit
    const availableStorage = 0; // Would need to get from Appwrite plan

    return NextResponse.json({
      success: true,
      storage: {
        total: formatBytes(totalStorage),
        used: formatBytes(usedStorage),
        available: availableStorage > 0 ? formatBytes(availableStorage) : 'Unlimited',
        percentage: availableStorage > 0 ? (usedStorage / totalStorage) * 100 : 0,
        breakdown: {
          files: {
            count: totalFiles,
            size: formatBytes(totalFileSize),
          },
          database: {
            documents: totalDocuments,
            size: formatBytes(estimatedDatabaseSize),
          },
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching storage stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch storage stats' },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

