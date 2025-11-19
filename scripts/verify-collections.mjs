/**
 * Verify Collection IDs Script
 * 
 * This script creates a comprehensive report showing:
 * 1. All collection IDs used in the codebase
 * 2. Which ones are lowercase (correct)
 * 3. Which ones are mixed-case (incorrect)
 * 4. Recommendations for fixing
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Collection IDs from the database (lowercase Table IDs)
const databaseCollectionIds = [
  'adminid',
  'questions',
  'pastpaperprogress',
  'pastpapers',
  'userprogress',
  'user',
];

// Find all collection ID usages
const collectionUsages = new Map();
const pattern = /collectionId\s*:\s*['"`]([^'"`]+)['"`]|listDocuments\s*\([^,]+,\s*['"`]([^'"`]+)['"`]|createDocument\s*\([^,]+,\s*['"`]([^'"`]+)['"`]|updateDocument\s*\([^,]+,\s*['"`]([^'"`]+)['"`]|getDocument\s*\([^,]+,\s*['"`]([^'"`]+)['"`]/g;

function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const collectionId = match[1] || match[2] || match[3] || match[4] || match[5];
      if (collectionId && collectionId.length > 0 && collectionId.length < 50) {
        if (!collectionUsages.has(collectionId)) {
          collectionUsages.set(collectionId, []);
        }
        collectionUsages.get(collectionId).push({
          file: filePath.replace(projectRoot + '\\', ''),
          line: content.substring(0, match.index).split('\n').length,
        });
      }
    }
  } catch (err) {
    // Skip files we can't read
  }
}

function scanDirectory(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (fullPath.includes('node_modules') || fullPath.includes('.next') || fullPath.includes('.git')) {
        continue;
      }
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...scanDirectory(fullPath));
        } else if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(extname(fullPath))) {
          files.push(fullPath);
        }
      } catch (err) {
        // Skip
      }
    }
  } catch (err) {
    // Skip
  }
  return files;
}

console.log('🔍 Scanning source files...\n');
const files = scanDirectory(join(projectRoot, 'src'));
files.forEach(scanFile);

console.log('📊 Collection ID Usage Report');
console.log('='.repeat(80));
console.log(`\nTotal unique collection IDs found: ${collectionUsages.size}`);
console.log(`Database collection IDs (lowercase): ${databaseCollectionIds.join(', ')}\n`);

// Check each collection ID
const issues = [];
const correct = [];

collectionUsages.forEach((usages, collectionId) => {
  const isLowerCase = collectionId === collectionId.toLowerCase();
  const expectedId = collectionId.toLowerCase();
  const inDatabase = databaseCollectionIds.includes(expectedId);
  
  if (isLowerCase && inDatabase) {
    correct.push({ id: collectionId, usages: usages.length });
  } else {
    issues.push({
      id: collectionId,
      expected: expectedId,
      isLowerCase,
      inDatabase,
      usages: usages.length,
      files: usages.slice(0, 3).map(u => u.file),
    });
  }
});

console.log('\n✅ Correct Collection IDs (lowercase and in database):');
console.log('-'.repeat(80));
correct.forEach(({ id, usages }) => {
  console.log(`  ✅ "${id}" - Used ${usages} time(s)`);
});

console.log('\n❌ Issues Found:');
console.log('-'.repeat(80));
if (issues.length === 0) {
  console.log('  ✅ No issues found! All collection IDs are lowercase and match database.');
} else {
  issues.forEach(({ id, expected, isLowerCase, inDatabase, usages, files }) => {
    console.log(`\n  ❌ "${id}"`);
    console.log(`     Expected: "${expected}"`);
    console.log(`     Is lowercase: ${isLowerCase ? 'Yes' : 'No'}`);
    console.log(`     In database: ${inDatabase ? 'Yes' : 'No'}`);
    console.log(`     Used ${usages} time(s)`);
    console.log(`     Files: ${files.join(', ')}`);
    if (!isLowerCase) {
      console.log(`     🔧 FIX: Replace "${id}" with "${expected}"`);
    }
    if (!inDatabase) {
      console.log(`     ⚠️  WARNING: "${expected}" not found in database collection list!`);
    }
  });
}

console.log('\n\n📝 Recommendations:');
console.log('='.repeat(80));
if (issues.length > 0) {
  console.log('\n1. Fix mixed-case collection IDs:');
  issues.filter(i => !i.isLowerCase).forEach(({ id, expected, files }) => {
    console.log(`   - Replace "${id}" with "${expected}" in ${files.length} file(s)`);
  });
  
  console.log('\n2. Verify database collections:');
  const missing = issues.filter(i => !i.inDatabase);
  if (missing.length > 0) {
    missing.forEach(({ expected }) => {
      console.log(`   - Check if "${expected}" exists in Appwrite Console`);
    });
  } else {
    console.log('   ✅ All collection IDs exist in database');
  }
} else {
  console.log('✅ All collection IDs are correct!');
}

console.log('\n✅ Verification complete!\n');

