import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const logType = searchParams.get('logType'); // 'all' | 'user' | 'admin' | 'system'

    const databases = getServerDatabases();

    try {
      const queries: string[] = [];
      if (startDate) {
        queries.push(`$createdAt.greaterThanEqual("${startDate}")`);
      }
      if (endDate) {
        queries.push(`$createdAt.lessThanEqual("${endDate}")`);
      }
      if (logType && logType !== 'all') {
        queries.push(`type.equal("${logType}")`);
      }
      queries.push('orderDesc("$createdAt")');
      queries.push('limit(1000)'); // Limit to prevent huge responses

      const logs = await databases.listDocuments(
        appwriteConfig.databaseId,
        'auditLogs',
        queries
      );

      if (searchParams.get('format') === 'csv') {
        // Generate CSV
        const csvHeader = 'Timestamp,Type,Action,User,Details\n';
        const csvRows = logs.documents.map((log: any) => {
          const timestamp = log.$createdAt || log.timestamp || '';
          const type = log.type || '';
          const action = log.action || '';
          const user = log.userId || log.email || '';
          const details = JSON.stringify(log.details || {});
          return `${timestamp},${type},${action},${user},"${details}"`;
        }).join('\n');

        return new NextResponse(csvHeader + csvRows, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="audit-logs-${startDate || 'all'}-${endDate || 'all'}.csv"`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        logs: logs.documents,
        total: logs.total,
      });
    } catch (error: any) {
      // Collection doesn't exist yet
      return NextResponse.json({
        success: true,
        logs: [],
        total: 0,
        message: 'Audit logs collection does not exist. Create it in Appwrite to start logging.',
      });
    }
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

