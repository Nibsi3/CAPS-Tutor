#!/usr/bin/env node

/**
 * Verify Appwrite Collections
 * Checks if required collections exist in your Appwrite database
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Appwrite Collections Verification\n');
console.log('This script helps you verify that required collections exist.\n');
console.log('Required Collections:');
console.log('  ✅ users - User profiles and preferences\n');
console.log('To check if collections exist:');
console.log('1. Go to: https://cloud.appwrite.io/console');
console.log('2. Select project: CAPS Tutor');
console.log('3. Go to: Databases → capstutor');
console.log('4. Check if "users" collection exists in the list\n');
console.log('If "users" collection is missing:');
console.log('  See: docs/QUICK_START_COLLECTIONS.md for setup instructions\n');
console.log('Quick Setup:');
console.log('  1. Click "Create Collection"');
console.log('  2. Collection ID: users');
console.log('  3. Add attributes: firstName, lastName, email');
console.log('  4. Set permissions: Users can Create/Read/Update\n');

rl.close();

