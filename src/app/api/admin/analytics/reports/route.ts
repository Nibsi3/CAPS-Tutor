import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportType, startDate, endDate, format } = body;

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Report type, start date, and end date are required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    // Get all users
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      'user',
      []
    );

    // Get user progress
    let userProgress: any[] = [];
    try {
      const progress = await databases.listDocuments(
        appwriteConfig.databaseId,
        'userprogress',
        []
      );
      userProgress = progress.documents;
    } catch (error) {
      // Collection might not exist
    }

    // Get past papers
    const papers = await databases.listDocuments(
      appwriteConfig.databaseId,
      'pastpapers',
      []
    );

    // Generate report based on type
    let reportData: any = {};

    if (reportType === 'usage') {
      reportData = {
        totalUsers: users.total,
        activeUsers: users.documents.filter((u: any) => u.lastLoginDate).length,
        totalStudyTime: userProgress.reduce((sum: number, p: any) => sum + (p.totalStudyTimeMinutes || 0), 0),
        totalQuestionsAnswered: userProgress.reduce((sum: number, p: any) => sum + (p.questionsAnswered || 0), 0),
        dateRange: { startDate, endDate },
      };
    } else if (reportType === 'performance') {
      reportData = {
        averageScore: userProgress.length > 0
          ? userProgress.reduce((sum: number, p: any) => sum + (p.averageScore || 0), 0) / userProgress.length
          : 0,
        totalCompletedLessons: userProgress.reduce((sum: number, p: any) => sum + (p.completedLessons || 0), 0),
        totalPastPapersAttempted: userProgress.reduce((sum: number, p: any) => sum + (p.pastPapersAttempted || 0), 0),
        dateRange: { startDate, endDate },
      };
    } else if (reportType === 'engagement') {
      reportData = {
        dailyActiveUsers: users.documents.filter((u: any) => {
          const lastLogin = new Date(u.lastLoginDate || u.$createdAt);
          const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceLogin <= 1;
        }).length,
        weeklyActiveUsers: users.documents.filter((u: any) => {
          const lastLogin = new Date(u.lastLoginDate || u.$createdAt);
          const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceLogin <= 7;
        }).length,
        monthlyActiveUsers: users.documents.filter((u: any) => {
          const lastLogin = new Date(u.lastLoginDate || u.$createdAt);
          const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceLogin <= 30;
        }).length,
        dateRange: { startDate, endDate },
      };
    } else if (reportType === 'mastery') {
      reportData = {
        totalSubjects: new Set(papers.documents.map((p: any) => p.subject)).size,
        totalPastPapers: papers.total,
        averageQuestionsPerPaper: papers.total > 0
          ? papers.documents.reduce((sum: number, p: any) => sum + (p.questionCount || 0), 0) / papers.total
          : 0,
        dateRange: { startDate, endDate },
      };
    }

    // Helper function to convert data to CSV
    const convertToCSV = (data: any): string => {
      const csvRows: string[] = [];
      csvRows.push('Metric,Value');
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Handle nested objects
          if (key === 'dateRange') {
            csvRows.push(`${key}.startDate,${(value as any).startDate || ''}`);
            csvRows.push(`${key}.endDate,${(value as any).endDate || ''}`);
          } else {
            csvRows.push(`${key},${JSON.stringify(value)}`);
          }
        } else if (Array.isArray(value)) {
          csvRows.push(`${key},${value.length} items`);
        } else {
          csvRows.push(`${key},${value}`);
        }
      });
      return csvRows.join('\n');
    };

    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-report-${startDate}-${endDate}.csv"`,
        },
      });
    }

    if (format === 'excel') {
      // Excel can open CSV files, so we'll use CSV format with Excel MIME type
      const csv = convertToCSV(reportData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="${reportType}-report-${startDate}-${endDate}.xls"`,
        },
      });
    }

    if (format === 'pdf') {
      // For PDF, we'll return JSON that can be converted to PDF on the client side
      // In a production environment, you'd use a library like pdfkit or puppeteer
      return NextResponse.json({
        success: true,
        reportType,
        data: reportData,
        generatedAt: new Date().toISOString(),
        format: 'pdf',
        message: 'PDF generation requires client-side conversion. Returning JSON data.',
      });
    }

    // Return JSON as default
    return NextResponse.json({
      success: true,
      reportType,
      data: reportData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}

