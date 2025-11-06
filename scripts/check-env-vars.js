#!/usr/bin/env node

/**
 * Check if environment variables are properly set
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

console.log('🔍 Checking environment variables...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('📝 Create .env.local with:');
  console.log('   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1');
  console.log('   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id');
  console.log('   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

const requiredVars = [
  'NEXT_PUBLIC_APPWRITE_ENDPOINT',
  'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
  'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
];

const optionalVars = [
  'GROQ_API_KEY',
  'NEWS_API_KEY',
];

console.log('📋 Required Variables:');
let allPresent = true;
requiredVars.forEach(varName => {
  const line = lines.find(l => l.trim().startsWith(`${varName}=`));
  if (line && !line.trim().startsWith('#')) {
    const value = line.split('=')[1]?.trim();
    if (value && value !== 'your_database_id_here' && value !== 'your_project_id') {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ⚠️  ${varName}: Set but appears to be a placeholder`);
      allPresent = false;
    }
  } else {
    console.log(`   ❌ ${varName}: NOT SET`);
    allPresent = false;
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const line = lines.find(l => l.trim().startsWith(`${varName}=`));
  if (line && !line.trim().startsWith('#')) {
    const value = line.split('=')[1]?.trim();
    console.log(`   ✅ ${varName}: Set`);
  } else {
    console.log(`   ⚠️  ${varName}: Not set (optional)`);
  }
});

if (allPresent) {
  console.log('\n✅ All required variables are set!');
  console.log('\n💡 If the app still shows errors:');
  console.log('   1. Stop the dev server (Ctrl+C)');
  console.log('   2. Delete .next folder: Remove-Item -Recurse -Force .next');
  console.log('   3. Restart: npm run dev');
  console.log('   4. Hard refresh browser: Ctrl+Shift+R');
} else {
  console.log('\n❌ Some required variables are missing!');
  console.log('   Please update .env.local and restart the dev server.');
  process.exit(1);
}

