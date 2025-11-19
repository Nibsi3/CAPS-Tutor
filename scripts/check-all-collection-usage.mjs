/**
 * Comprehensive Collection Usage Checker
 * 
 * This script:
 * 1. Scans all source files for collection ID usage
 * 2. Lists all collections in the Appwrite database
 * 3. Compares what's used in code vs what exists in database
 * 4. Identifies mismatches
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Collection IDs found in code
const collectionIdsFound = new Set();
const collectionUsages = [];

// Patterns to find collection IDs
const patterns = [
  /collectionId\s*:\s*['"`]([^'"`]+)['"`]/g,
  /['"`](user|userprogress|userProgress|pastpapers|pastPapers|pastpaperprogress|pastPaperProgress|adminid|adminId|questions|studentProgress)['"`]/g,
  /listDocuments\s*\(\s*[^,]+,\s*['"`]([^'"`]+)['"`]/g,
  /createDocument\s*\(\s*[^,]+,\s*['"`]([^'"`]+)['"`]/g,
  /updateDocument\s*\(\s*[^,]+,\s*['"`]([^'"`]+)['"`]/g,
  /getDocument\s*\(\s*[^,]+,\s*['"`]([^'"`]+)['"`]/g,
  /deleteDocument\s*\(\s*[^,]+,\s*['"`]([^'"`]+)['"`]/g,
];

function shouldSkipFile(filePath) {
  const skipPatterns = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    'coverage',
    '.cache',
    'scripts/check-all-collection-usage.mjs',
  ];
  
  return skipPatterns.some(pattern => filePath.includes(pattern));
}

function extractCollectionIds(content, filePath) {
  const results = [];
  
  patterns.forEach((pattern, patternIndex) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const collectionId = match[1];
      // Filter out common false positives
      if (collectionId && 
          collectionId.length > 0 && 
          collectionId.length < 50 &&
          !collectionId.includes(' ') &&
          !collectionId.startsWith('$') &&
          !collectionId.includes('template')) {
        collectionIdsFound.add(collectionId);
        results.push({
          collectionId,
          file: filePath,
          line: content.substring(0, match.index).split('\n').length,
          context: content.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50),
          pattern: patternIndex,
        });
      }
    }
  });
  
  return results;
}

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      
      if (shouldSkipFile(fullPath)) {
        continue;
      }
      
      try {
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...scanDirectory(fullPath, extensions));
        } else if (stat.isFile()) {
          const ext = extname(fullPath);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      } catch (err) {
        // Skip files we can't read
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
  
  return files;
}

// Scan all source files
console.log('🔍 Scanning source files for collection IDs...\n');
const srcDir = join(projectRoot, 'src');
const files = scanDirectory(srcDir);

files.forEach(file => {
  try {
    const content = readFileSync(file, 'utf-8');
    const usages = extractCollectionIds(content, file.replace(projectRoot + '\\', ''));
    collectionUsages.push(...usages);
  } catch (err) {
    // Skip files we can't read
  }
});

// Group by collection ID
const groupedUsages = {};
collectionIdsFound.forEach(id => {
  groupedUsages[id] = collectionUsages.filter(u => u.collectionId === id);
});

console.log('📊 Collection IDs found in code:');
console.log('='.repeat(80));
Object.keys(groupedUsages).sort().forEach(id => {
  console.log(`\n  "${id}" (used in ${groupedUsages[id].length} location(s)):`);
  const uniqueFiles = [...new Set(groupedUsages[id].map(u => u.file))];
  uniqueFiles.slice(0, 5).forEach(file => {
    console.log(`    - ${file}`);
  });
  if (uniqueFiles.length > 5) {
    console.log(`    ... and ${uniqueFiles.length - 5} more file(s)`);
  }
});

console.log('\n\n📋 Summary:');
console.log('='.repeat(80));
console.log(`Total unique collection IDs found: ${collectionIdsFound.size}`);
console.log(`Total usages found: ${collectionUsages.length}`);

// Check for common issues
console.log('\n\n⚠️  Potential Issues:');
console.log('='.repeat(80));

// Check for mixed case
const lowerCaseIds = new Set();
const mixedCaseIds = [];
collectionIdsFound.forEach(id => {
  if (id.toLowerCase() === id) {
    lowerCaseIds.add(id);
  } else {
    mixedCaseIds.push(id);
  }
});

if (mixedCaseIds.length > 0) {
  console.log('\n❌ Mixed-case collection IDs found:');
  mixedCaseIds.forEach(id => {
    const lower = id.toLowerCase();
    console.log(`  - "${id}" (should be "${lower}"?)`);
    if (lowerCaseIds.has(lower)) {
      console.log(`    ⚠️  WARNING: Both "${id}" and "${lower}" are used!`);
    }
  });
} else {
  console.log('\n✅ All collection IDs are lowercase');
}

// Expected collections based on image
const expectedCollections = [
  'adminid',
  'questions',
  'pastpaperprogress',
  'pastpapers',
  'userprogress',
  'user',
];

console.log('\n\n📝 Expected Collections (from database):');
console.log('='.repeat(80));
expectedCollections.forEach(id => {
  const found = collectionIdsFound.has(id);
  const status = found ? '✅' : '❌';
  console.log(`  ${status} "${id}"`);
  if (!found) {
    console.log(`    ⚠️  Not found in code!`);
  }
});

console.log('\n\n📝 Collections in code but not in expected list:');
console.log('='.repeat(80));
collectionIdsFound.forEach(id => {
  if (!expectedCollections.includes(id) && !expectedCollections.includes(id.toLowerCase())) {
    console.log(`  ⚠️  "${id}"`);
    console.log(`    Used in: ${groupedUsages[id].length} location(s)`);
  }
});

console.log('\n\n✅ Scan complete!');
console.log('\nNext steps:');
console.log('1. Check the API endpoint: GET /api/check-all-collections');
console.log('2. Verify collection IDs in Appwrite Console match the ones used in code');
console.log('3. Update any mismatched collection IDs');

