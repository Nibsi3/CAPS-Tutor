/**
 * Script to add an admin user to the admins collection
 * 
 * Usage:
 *   node scripts/add-admin.mjs cameronfalck03@gmail.com
 *   node scripts/add-admin.mjs cameronfalck03@gmail.com superadmin
 */

import { Client, Databases, ID } from 'appwrite';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables from .env.local if it exists
let endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
let projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '690a39bf0011810ee554';
let databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'capstutor';
// Collection ID - update this if your collection uses a different ID
// Collection IDs must be lowercase: 'adminid' (not 'adminId')
let collectionId = 'adminid'; // Collection ID must be lowercase

// Try to read from .env.local
try {
  const envPath = join(__dirname, '..', '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_APPWRITE_ENDPOINT=')) {
      endpoint = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
    } else if (trimmed.startsWith('NEXT_PUBLIC_APPWRITE_PROJECT_ID=')) {
      projectId = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
    } else if (trimmed.startsWith('NEXT_PUBLIC_APPWRITE_DATABASE_ID=')) {
      databaseId = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  }
} catch (error) {
  console.log('⚠️  Could not read .env.local, using defaults or environment variables');
}

// Get email and role from command line arguments
const email = process.argv[2];
const role = process.argv[3] || 'superadmin';

if (!email) {
  console.error('❌ Error: Email is required');
  console.log('\nUsage:');
  console.log('  node scripts/add-admin.mjs <email> [role]');
  console.log('\nExample:');
  console.log('  node scripts/add-admin.mjs cameronfalck03@gmail.com superadmin');
  process.exit(1);
}

// Validate email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

// Validate role
const validRoles = ['superadmin', 'manager', 'viewer'];
if (!validRoles.includes(role)) {
  console.error(`❌ Error: Invalid role. Must be one of: ${validRoles.join(', ')}`);
  process.exit(1);
}

console.log('📋 Adding admin user...');
console.log(`   Email: ${email}`);
console.log(`   Role: ${role}`);
console.log(`   Database: ${databaseId}`);
console.log(`   Collection: ${collectionId}`);
console.log('');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const databases = new Databases(client);

// Check if admin already exists
try {
  const existing = await databases.listDocuments(
    databaseId,
    collectionId,
    [`email.equal("${email}")`]
  );

  if (existing.documents && existing.documents.length > 0) {
    const admin = existing.documents[0];
    console.log('⚠️  Admin with this email already exists:');
    console.log(`   ID: ${admin.$id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Status: ${admin.status}`);
    console.log('\n✅ No action needed - admin already exists.');
    process.exit(0);
  }
} catch (error) {
  // Collection might not exist, we'll handle that when creating
}

// Generate UUID for adminId
const adminId = ID.unique();

// Create admin document
const now = new Date().toISOString();
const defaultPermissions = [
  'edit_users',
  'view_stats',
  'manage_papers',
  'delete_content',
  'manage_admins'
];

const adminData = {
  adminId,
  email,
  passwordHash: '', // Empty for now since we use Appwrite Auth
  role,
  permissions: defaultPermissions,
  status: 'active',
  createdAt: now,
  updatedAt: now,
  notes: `Admin account created via script for ${email}`
};

try {
  console.log('🔄 Creating admin document...');
  const result = await databases.createDocument(
    databaseId,
    collectionId,
    ID.unique(), // Document ID (Appwrite will generate)
    adminData
  );

  console.log('\n✅ Admin created successfully!');
  console.log(`   Document ID: ${result.$id}`);
  console.log(`   Admin ID: ${result.adminId}`);
  console.log(`   Email: ${result.email}`);
  console.log(`   Role: ${result.role}`);
  console.log(`   Status: ${result.status}`);
  console.log(`   Permissions: ${result.permissions?.join(', ') || 'none'}`);
  console.log('\n🎉 You can now log in and use the admin toggle button!');
} catch (error) {
  // Handle collection not found error
  if (error.code === 404 && error.message?.toLowerCase().includes('collection')) {
    console.error('\n❌ Error: Admins collection not found!');
    console.error(`\nThe collection "${collectionId}" does not exist in database "${databaseId}".`);
    console.error('\nPlease check:');
    console.error(`1. Collection ID is correct (currently: "${collectionId}")`);
    console.error(`   - Collection ID must be lowercase: "adminid" (not "adminId")`);
    console.error(`2. Collection exists in database: ${databaseId}`);
    console.error(`3. See docs/APPWRITE_ADMINS_COLLECTION_SCHEMA.md for setup instructions`);
    console.error('\nTo fix:');
    console.error('1. Go to Appwrite Console → Databases → ' + databaseId);
    console.error(`2. Create collection with ID: "${collectionId}"`);
    console.error('3. Add all required attributes and indexes');
    console.error('4. Run this script again');
    process.exit(1);
  }

  // Handle other errors
  console.error('\n❌ Error creating admin:');
  console.error(`   Code: ${error.code || 'unknown'}`);
  console.error(`   Message: ${error.message || 'Unknown error'}`);
  console.error('\nFull error:', error);
  process.exit(1);
}

