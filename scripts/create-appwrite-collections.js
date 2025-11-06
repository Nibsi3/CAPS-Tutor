#!/usr/bin/env node

/**
 * Create Appwrite Collections
 * 
 * This script helps create the required collections in Appwrite.
 * You can either:
 * 1. Use the Appwrite Console (recommended) - see docs/APPWRITE_COLLECTIONS_SETUP.md
 * 2. Use Appwrite CLI (if available)
 * 3. Use this script as a reference
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log('📋 Appwrite Collections Setup Helper\n');
console.log('This script will guide you through creating the required collections.\n');
console.log('You can also create them manually in the Appwrite Console:\n');
console.log('1. Go to: https://cloud.appwrite.io/console');
console.log('2. Select your project: CAPS Tutor');
console.log('3. Go to: Databases → capstutor → Create Collection\n');
console.log('For detailed instructions, see: docs/APPWRITE_COLLECTIONS_SETUP.md\n');

async function main() {
  const useConsole = await question('Do you want to create collections manually in the console? (yes/no): ');
  
  if (useConsole.toLowerCase() === 'yes' || useConsole.toLowerCase() === 'y') {
    console.log('\n✅ Please follow these steps:\n');
    console.log('1. Go to: https://cloud.appwrite.io/console');
    console.log('2. Select project: CAPS Tutor');
    console.log('3. Go to: Databases → capstutor');
    console.log('4. Click: Create Collection');
    console.log('5. Collection ID: users');
    console.log('6. Name: Users');
    console.log('7. Click: Create\n');
    console.log('Then add these attributes:');
    console.log('- firstName (String, 255)');
    console.log('- lastName (String, 255)');
    console.log('- email (String, 255)');
    console.log('- gradeLevel (Integer, 1-12)');
    console.log('- subjects (String Array)');
    console.log('- language (String, default: "en")');
    console.log('- loginDates (String Array)');
    console.log('- lastLoginDate (String)');
    console.log('- lastLoginTimestamp (String)');
    console.log('- totalStudyTimeMinutes (Integer)');
    console.log('- unlockedAchievements (String Array)');
    console.log('\nSet permissions:');
    console.log('- Create: Users');
    console.log('- Read: Users');
    console.log('- Update: Users\n');
    console.log('See docs/APPWRITE_COLLECTIONS_SETUP.md for complete instructions.\n');
    rl.close();
    return;
  }

  console.log('\n⚠️  To create collections programmatically, you need to use the Appwrite CLI or SDK.');
  console.log('For now, please use the Appwrite Console method above.\n');
  console.log('To use Appwrite CLI:');
  console.log('1. Install: npm install -g appwrite-cli');
  console.log('2. Login: appwrite login');
  console.log('3. Create collection: appwrite databases createCollection --databaseId=capstutor --collectionId=users\n');
  
  rl.close();
}

main().catch(console.error);


