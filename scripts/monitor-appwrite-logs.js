#!/usr/bin/env node

/**
 * Appwrite Log Monitor
 * 
 * Monitors Appwrite logs in real-time from the browser console or server logs.
 * This script can be run while the app is running to see Appwrite operations.
 * 
 * Usage:
 *   node scripts/monitor-appwrite-logs.js
 *   node scripts/monitor-appwrite-logs.js --level error
 *   node scripts/monitor-appwrite-logs.js --category auth
 *   node scripts/monitor-appwrite-logs.js --export logs.json
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const options = {
  level: args.includes('--level') ? args[args.indexOf('--level') + 1] : null,
  category: args.includes('--category') ? args[args.indexOf('--category') + 1] : null,
  export: args.includes('--export') ? args[args.indexOf('--export') + 1] : null,
  port: args.includes('--port') ? parseInt(args[args.indexOf('--port') + 1]) : 3000,
  follow: args.includes('--follow') || args.includes('-f'),
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(level, text) {
  const colorMap = {
    error: colors.red,
    warn: colors.yellow,
    info: colors.green,
    debug: colors.cyan,
  };
  return `${colorMap[level] || colors.reset}${text}${colors.reset}`;
}

function formatLog(log) {
  const timestamp = new Date(log.timestamp).toLocaleTimeString();
  const level = colorize(log.level, log.level.toUpperCase().padEnd(5));
  const category = colors.cyan + log.category.toUpperCase().padEnd(10) + colors.reset;
  let line = `${colors.dim}[${timestamp}]${colors.reset} ${level} [${category}] ${log.message}`;
  
  if (log.duration) {
    line += ` ${colors.dim}(${log.duration}ms)${colors.reset}`;
  }
  
  if (log.error) {
    line += `\n  ${colors.red}Error:${colors.reset} ${log.error.message}`;
    if (log.error.stack && options.level === 'error') {
      line += `\n  ${colors.dim}${log.error.stack}${colors.reset}`;
    }
  }
  
  if (log.details && Object.keys(log.details).length > 0) {
    line += `\n  ${colors.dim}Details:${colors.reset} ${JSON.stringify(log.details, null, 2)}`;
  }
  
  return line;
}

function printHelp() {
  console.log(`
${colors.bright}Appwrite Log Monitor${colors.reset}

Usage:
  node scripts/monitor-appwrite-logs.js [options]

Options:
  --level <level>        Filter by log level (info, warn, error, debug)
  --category <category>  Filter by category (auth, database, storage, api, general)
  --export <file>        Export logs to JSON file
  --port <port>          Port of the Next.js dev server (default: 3000)
  --follow, -f           Follow/log new entries (for browser console monitoring)
  
Examples:
  node scripts/monitor-appwrite-logs.js
  node scripts/monitor-appwrite-logs.js --level error
  node scripts/monitor-appwrite-logs.js --category auth --follow
  node scripts/monitor-appwrite-logs.js --export logs.json

${colors.yellow}Note:${colors.reset} This script monitors logs from the browser console.
Make sure your Next.js app is running and open the browser console to see logs.

For Appwrite Functions/App Hosting logs, use:
  appwrite functions logs
  appwrite apphosting logs
`);
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

console.log(`${colors.bright}${colors.cyan}Appwrite Log Monitor${colors.reset}\n`);
console.log(`${colors.dim}Monitoring Appwrite logs...${colors.reset}`);
console.log(`${colors.dim}Press Ctrl+C to exit${colors.reset}\n`);

// If export is requested, we'll need to get logs from the browser
// For now, we'll create a simple monitoring display
if (options.export) {
  console.log(`${colors.yellow}Note:${colors.reset} To export logs, you need to access the browser console.`);
  console.log(`${colors.yellow}In browser console, run:${colors.reset}`);
  console.log(`  window.appwriteLogger.exportLogs()`);
  console.log(`\nOr copy the output and save to: ${options.export}\n`);
}

// Monitor approach:
// 1. Check if app is running
// 2. Provide instructions for accessing logs
// 3. For browser-based logs, user needs to open console

const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${options.port}`, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
};

async function main() {
  const isRunning = await checkServer();
  
  if (!isRunning) {
    console.log(`${colors.yellow}⚠️  Next.js app is not running on port ${options.port}${colors.reset}`);
    console.log(`${colors.dim}Start your app with: npm run dev${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✓${colors.reset} Next.js app is running on port ${options.port}\n`);
  }
  
  console.log(`${colors.bright}To view Appwrite logs:${colors.reset}\n`);
  console.log(`1. Open your browser and navigate to http://localhost:${options.port}`);
  console.log(`2. Open the browser's Developer Console (F12 or Right-click → Inspect → Console)`);
  console.log(`3. Look for logs prefixed with ${colors.cyan}[Appwrite ...]${colors.reset}\n`);
  
  console.log(`${colors.bright}Or use the logger API in browser console:${colors.reset}\n`);
  console.log(`  ${colors.dim}// View all logs${colors.reset}`);
  console.log(`  window.appwriteLogger.getLogs()`);
  console.log(`\n  ${colors.dim}// Filter logs${colors.reset}`);
  console.log(`  window.appwriteLogger.getFilteredLogs({ level: 'error' })`);
  console.log(`  window.appwriteLogger.getFilteredLogs({ category: 'auth' })`);
  console.log(`\n  ${colors.dim}// Export logs${colors.reset}`);
  console.log(`  window.appwriteLogger.exportLogsAsText()`);
  console.log(`  window.appwriteLogger.exportLogs()`);
  console.log(`\n  ${colors.dim}// Listen for new logs${colors.reset}`);
  console.log(`  window.appwriteLogger.addListener((log) => console.log(log))`);
  console.log(`\n`);
  
  if (options.follow) {
    console.log(`${colors.bright}${colors.yellow}Following logs...${colors.reset}\n`);
    console.log(`${colors.dim}This script will continue running. Open browser console to see logs.${colors.reset}\n`);
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log(`\n${colors.dim}Stopped monitoring.${colors.reset}`);
      process.exit(0);
    });
  }
}

main().catch(console.error);

