#!/usr/bin/env node

/**
 * Create System Settings Collection in Appwrite
 * 
 * This script provides instructions and can help verify the collection setup.
 * For actual creation, use the Appwrite Console (recommended) or Appwrite CLI.
 */

import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'capstutor';

if (!projectId || !apiKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Required: APPWRITE_PROJECT_ID (or NEXT_PUBLIC_APPWRITE_PROJECT_ID)');
  console.error('Required: APPWRITE_API_KEY');
  console.error('\nPlease set these in your .env.local file');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

const COLLECTION_ID = 'systemSettings';
const COLLECTION_NAME = 'System Settings';

// Attribute definitions
const attributes = [
  // Boolean
  { key: 'maintenanceMode', type: 'boolean', required: false, default: false },
  
  // Strings
  { key: 'maintenanceMessage', type: 'string', size: 1000, required: false },
  { key: 'maintenanceDuration', type: 'string', size: 100, required: false },
  { key: 'emailProvider', type: 'string', size: 100, required: false },
  { key: 'smtpServer', type: 'string', size: 255, required: false },
  { key: 'fromEmail', type: 'string', size: 255, required: false },
  { key: 'smtpPassword', type: 'string', size: 500, required: false },
  { key: 'smsProvider', type: 'string', size: 100, required: false },
  { key: 'smsApiKey', type: 'string', size: 500, required: false },
  { key: 'updatedBy', type: 'string', size: 255, required: false },
  { key: 'updatedAt', type: 'string', size: 100, required: false },
  
  // Integer
  { key: 'smtpPort', type: 'integer', required: false, min: 1, max: 65535, default: 587 },
  
  // JSON
  { key: 'features', type: 'json', required: false },
  { key: 'aiConfig', type: 'json', required: false },
  { key: 'cacheSettings', type: 'json', required: false },
  { key: 'retentionPolicies', type: 'json', required: false },
  { key: 'availability', type: 'json', required: false },
];

async function checkCollectionExists() {
  try {
    await databases.getCollection(databaseId, COLLECTION_ID);
    return true;
  } catch (error) {
    return false;
  }
}

async function createCollection() {
  try {
    console.log(`📦 Creating collection: ${COLLECTION_NAME} (${COLLECTION_ID})...`);
    
    const collection = await databases.createCollection(
      databaseId,
      COLLECTION_ID,
      COLLECTION_NAME
    );
    
    console.log(`✅ Collection created: ${collection.$id}`);
    return collection;
  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️  Collection already exists: ${COLLECTION_ID}`);
      return null;
    }
    throw error;
  }
}

async function createAttribute(attr) {
  try {
    console.log(`  Creating attribute: ${attr.key} (${attr.type})...`);
    
    if (attr.type === 'boolean') {
      await databases.createBooleanAttribute(
        databaseId,
        COLLECTION_ID,
        attr.key,
        attr.required || false,
        attr.default || false
      );
    } else if (attr.type === 'string') {
      await databases.createStringAttribute(
        databaseId,
        COLLECTION_ID,
        attr.key,
        attr.size || 255,
        attr.required || false,
        attr.default || undefined,
        attr.array || false
      );
    } else if (attr.type === 'integer') {
      await databases.createIntegerAttribute(
        databaseId,
        COLLECTION_ID,
        attr.key,
        attr.required || false,
        attr.min || undefined,
        attr.max || undefined,
        attr.default || undefined,
        attr.array || false
      );
    } else if (attr.type === 'json') {
      await databases.createJsonAttribute(
        databaseId,
        COLLECTION_ID,
        attr.key,
        attr.required || false,
        attr.array || false
      );
    }
    
    console.log(`  ✅ Attribute created: ${attr.key}`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ️  Attribute already exists: ${attr.key}`);
    } else {
      console.error(`  ❌ Error creating attribute ${attr.key}:`, error.message);
      throw error;
    }
  }
}

async function createInitialDocuments() {
  const defaultSettings = {
    maintenanceMode: false,
    maintenanceMessage: '',
    maintenanceDuration: '',
    features: {
      aiTutor: true,
      pastPapers: true,
      practiceQuestions: true,
      weeklyTasks: false,
      achievements: true,
      progressTracking: true,
    },
    aiConfig: {
      responseLimit: 100,
      safetyFilters: true,
      difficultyLevel: 'medium',
    },
    cacheSettings: {
      autoUpdate: true,
      updateFrequency: 'daily',
    },
    retentionPolicies: {
      userData: '7years',
      activityLogs: '2years',
    },
  };

  const allCAPSSubjects = [
    'Mathematics',
    'Mathematical Literacy',
    'Physical Sciences',
    'Life Sciences',
    'Accounting',
    'Business Studies',
    'Economics',
    'Geography',
    'History',
    'Information Technology',
    'Computer Applications Technology (CAT)',
    'Tourism',
    'Consumer Studies',
    'Hospitality Studies',
    'Engineering Graphics & Design',
    'English Home Language',
    'English First Additional Language',
    'Afrikaans Huistaal',
    'Afrikaans Eerste Addisionele Taal',
  ];

  const subjectAvailability = {
    availability: {
      '10': allCAPSSubjects,
      '11': allCAPSSubjects,
      '12': allCAPSSubjects,
    },
  };

  const emailSmsConfig = {
    emailProvider: '',
    smtpServer: '',
    smtpPort: 587,
    fromEmail: '',
    smsProvider: '',
  };

  const documents = [
    { id: 'systemSettings', data: defaultSettings },
    { id: 'subjectAvailability', data: subjectAvailability },
    { id: 'emailSmsConfig', data: emailSmsConfig },
  ];

  console.log('\n📄 Creating initial documents...');
  
  for (const doc of documents) {
    try {
      await databases.createDocument(
        databaseId,
        COLLECTION_ID,
        doc.id,
        doc.data
      );
      console.log(`  ✅ Document created: ${doc.id}`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`  ℹ️  Document already exists: ${doc.id}`);
      } else {
        console.error(`  ❌ Error creating document ${doc.id}:`, error.message);
        // Continue with other documents
      }
    }
  }
}

async function main() {
  console.log('🚀 System Settings Collection Setup\n');
  console.log(`Database: ${databaseId}`);
  console.log(`Collection: ${COLLECTION_NAME} (${COLLECTION_ID})\n`);

  try {
    // Check if collection exists
    const exists = await checkCollectionExists();
    
    if (!exists) {
      // Create collection
      await createCollection();
      
      // Wait a bit for collection to be ready
      console.log('\n⏳ Waiting for collection to be ready...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create attributes
      console.log('\n📋 Creating attributes...');
      for (const attr of attributes) {
        await createAttribute(attr);
        // Small delay between attributes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Wait for attributes to be ready
      console.log('\n⏳ Waiting for attributes to be ready...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create initial documents
      await createInitialDocuments();
      
      console.log('\n✅ Collection setup complete!');
    } else {
      console.log(`ℹ️  Collection already exists: ${COLLECTION_ID}`);
      console.log('Checking attributes...\n');
      
      // Try to create missing attributes
      for (const attr of attributes) {
        await createAttribute(attr);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Try to create missing documents
      await createInitialDocuments();
      
      console.log('\n✅ Collection verification complete!');
    }
    
    console.log('\n📚 For detailed manual setup instructions, see:');
    console.log('   docs/APPWRITE_SYSTEM_SETTINGS_COLLECTION.md\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Tip: You can also create the collection manually in the Appwrite Console:');
    console.error('   1. Go to: https://cloud.appwrite.io/console');
    console.error('   2. Select project: CAPS Tutor');
    console.error('   3. Go to: Databases → capstutor → Create Collection');
    console.error('   4. Follow the guide in docs/APPWRITE_SYSTEM_SETTINGS_COLLECTION.md\n');
    process.exit(1);
  }
}

main().catch(console.error);

