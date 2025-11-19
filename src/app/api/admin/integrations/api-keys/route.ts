import { NextRequest, NextResponse } from 'next/server';
import { getServerDatabases, ID } from '@/lib/appwrite-server';
import { appwriteConfig } from '@/appwrite/config';
import crypto from 'crypto';

// Simple encryption/decryption (in production, use a proper key management system)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function GET(request: NextRequest) {
  try {
    const databases = getServerDatabases();

    try {
      const apiKeys = await databases.listDocuments(
        appwriteConfig.databaseId,
        'apiKeys',
        ['orderDesc("$createdAt")']
      );

      // Don't return the actual keys, just metadata
      const safeKeys = apiKeys.documents.map((key: any) => ({
        id: key.$id,
        serviceName: key.serviceName,
        description: key.description,
        active: key.active,
        lastUsed: key.lastUsed || null,
        createdAt: key.$createdAt,
        // Don't include encryptedKey in response
      }));

      return NextResponse.json({
        success: true,
        apiKeys: safeKeys,
        total: apiKeys.total,
      });
    } catch (error: any) {
      return NextResponse.json({
        success: true,
        apiKeys: [],
        total: 0,
      });
    }
  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceName, apiKey, description, active, userId } = body;

    if (!serviceName || !apiKey || !userId) {
      return NextResponse.json(
        { success: false, error: 'Service name, API key, and user ID are required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey);

    try {
      const keyId = ID.unique();
      await databases.createDocument(
        appwriteConfig.databaseId,
        'apiKeys',
        keyId,
        {
          serviceName,
          encryptedKey,
          description: description || '',
          active: active !== undefined ? active : true,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          lastUsed: null,
        }
      );

      return NextResponse.json({
        success: true,
        keyId,
        message: 'API key saved successfully',
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'API keys collection does not exist. Please create it in Appwrite first.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error saving API key:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save API key' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyId, apiKey, ...updates } = body;

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();

    const updateData: any = { ...updates };
    if (apiKey) {
      // Encrypt the new API key
      updateData.encryptedKey = encrypt(apiKey);
    }

    await databases.updateDocument(
      appwriteConfig.databaseId,
      'apiKeys',
      keyId,
      updateData
    );

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const databases = getServerDatabases();
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      'apiKeys',
      keyId
    );

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

