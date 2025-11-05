// Entry point for Appwrite Functions
// This script finds and starts the Next.js standalone server

const { spawn } = require('child_process');
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
const env = {
  ...process.env,
  PORT: process.env.PORT || '3000',
  HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'production',
};

console.log(`Starting Next.js server on port ${env.PORT}`);
console.log(`Server path: ${serverPath}`);
console.log(`Working directory: ${process.cwd()}`);

// Start the server
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: env,
  cwd: path.dirname(serverPath),
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.error(`Server exited with code ${code}`);
  process.exit(code || 1);
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.kill('SIGINT');
});

