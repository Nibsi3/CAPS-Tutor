// Entry point for Appwrite Functions
// Simplified entry point that directly requires server.js instead of spawning
// This avoids potential issues with spawn in Appwrite Functions environment

const path = require('path');
const fs = require('fs');

// Try different possible paths for server.js
const possiblePaths = [
  path.join(__dirname, '.next/standalone/server.js'),
  path.join(__dirname, 'server.js'),
  path.join(process.cwd(), '.next/standalone/server.js'),
  path.join(process.cwd(), 'server.js'),
];

// Also search recursively in .next/standalone for server.js
function findServerInStandalone(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = findServerInStandalone(fullPath);
        if (found) return found;
      } else if (entry.name === 'server.js') {
        return fullPath;
      }
    }
  } catch (err) {
    // Ignore errors
  }
  return null;
}

let serverPath = null;

// First try the standard paths
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    serverPath = possiblePath;
    console.log(`Found server.js at: ${serverPath}`);
    break;
  }
}

// If not found, search recursively in standalone directory
if (!serverPath) {
  const standaloneDir = path.join(process.cwd(), '.next/standalone');
  if (fs.existsSync(standaloneDir)) {
    serverPath = findServerInStandalone(standaloneDir);
    if (serverPath) {
      console.log(`Found server.js at: ${serverPath}`);
    }
  }
}

if (!serverPath) {
  console.error('Could not find server.js. Searched paths:');
  possiblePaths.forEach(p => console.error(`  - ${p}`));
  process.exit(1);
}

// Set environment variables
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log(`Starting Next.js server on port ${process.env.PORT}`);
console.log(`Server path: ${serverPath}`);
console.log(`Working directory: ${process.cwd()}`);

// Change to the directory containing server.js (this is the standalone root)
// The standalone directory should contain server.js, node_modules, and other required files
const standaloneRoot = path.dirname(serverPath);
process.chdir(standaloneRoot);

console.log(`Changed working directory to: ${process.cwd()}`);

// Require server.js using relative path from the standalone root
// Since we changed to the standalone root, we can use './server.js'
try {
  require('./server.js');
} catch (error) {
  console.error('Failed to start server:', error);
  console.error('Error details:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

