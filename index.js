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

let serverPath = null;

// Find the server.js file
for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    serverPath = possiblePath;
    console.log(`Found server.js at: ${serverPath}`);
    break;
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

// Change to the directory containing server.js
process.chdir(path.dirname(serverPath));

// Directly require the server.js file
// This is simpler and more reliable than spawn in Appwrite Functions
try {
  require(serverPath);
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

