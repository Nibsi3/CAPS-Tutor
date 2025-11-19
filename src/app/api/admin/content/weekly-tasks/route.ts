import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';

export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();
    const searchParams = request.nextUrl.searchParams;
    const grade = searchParams.get('grade');
    const subject = searchParams.get('subject');
    const week = searchParams.get('week');

    try {
      const queries: string[] = [];
      if (grade) {
        queries.push(`grade.equal(${grade})`);
      }
      if (subject) {
        queries.push(`subject.contains("${subject}")`);
      }
      if (week) {
        queries.push(`week.equal("${week}")`);
      }
      queries.push('orderDesc("$createdAt")');

      const tasks = await databases.listDocuments(
        appwriteConfig.databaseId,
        'weeklyTasks',
        queries
      );

      return NextResponse.json({
        success: true,
        tasks: tasks.documents,
        total: tasks.total,
      });
    } catch (error: any) {
      // Collection doesn't exist yet, return empty
      return NextResponse.json({
        success: true,
        tasks: [],
        total: 0,
      });
    }
  } catch (error: any) {
    console.error('Error fetching weekly tasks:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch weekly tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grade, subject, week, title, description, tasks, dueDate, userId } = body;

    if (!grade || !subject || !week || !title || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    try {
      const taskId = ID.unique();
      await databases.createDocument(
        appwriteConfig.databaseId,
        'weeklyTasks',
        taskId,
        {
          grade: parseInt(grade),
          subject,
          week,
          title,
          description: description || '',
          tasks: tasks || [],
          dueDate: dueDate || null,
          createdBy: userId,
          status: 'draft',
          publishedAt: null,
        }
      );

      return NextResponse.json({
        success: true,
        taskId,
        message: 'Weekly task created successfully',
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'Weekly tasks collection does not exist. Please create it in Appwrite first.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating weekly task:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create weekly task' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, ...updates } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();
    await databases.updateDocument(
      appwriteConfig.databaseId,
      'weeklyTasks',
      taskId,
      updates
    );

    return NextResponse.json({
      success: true,
      message: 'Weekly task updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating weekly task:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update weekly task' },
      { status: 500 }
    );
  }
}

