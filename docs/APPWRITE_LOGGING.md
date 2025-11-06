# Appwrite Logging Guide

This guide explains how to monitor and view Appwrite logs in the CAPS Tutor application.

## Overview

The application includes a comprehensive logging system for all Appwrite operations, including:
- Authentication events (login, logout, session checks)
- Database operations (queries, document retrieval)
- API calls and responses
- Errors and warnings

## Quick Start

### 1. View Logs in Browser Console

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:9002`

3. Open the Developer Console (F12 or Right-click → Inspect → Console)

4. Look for logs prefixed with `[Appwrite ...]`

### 2. Use the Log Monitor Script

**Windows (PowerShell):**
```bash
npm run logs:appwrite:ps
```

**Cross-platform (Node.js):**
```bash
npm run logs:appwrite
```

The script will:
- Check if your app is running
- Provide instructions for accessing logs
- Show examples of how to use the logger API

## Using the Logger API

The logger is available in the browser console as `window.appwriteLogger` (development mode only).

### View All Logs

```javascript
window.appwriteLogger.getLogs()
```

### Filter Logs

```javascript
// Get only error logs
window.appwriteLogger.getFilteredLogs({ level: 'error' })

// Get only auth-related logs
window.appwriteLogger.getFilteredLogs({ category: 'auth' })

// Get recent error logs (last 50)
window.appwriteLogger.getFilteredLogs({ 
  level: 'error', 
  limit: 50 
})

// Get database errors
window.appwriteLogger.getFilteredLogs({ 
  category: 'database',
  level: 'error'
})
```

### Listen for New Logs

```javascript
// Listen for all new logs
window.appwriteLogger.addListener((log) => {
  console.log('New log:', log);
})

// Listen for errors only
window.appwriteLogger.addListener((log) => {
  if (log.level === 'error') {
    console.error('Error occurred:', log);
  }
})
```

### Export Logs

```javascript
// Export as JSON
const jsonLogs = window.appwriteLogger.exportLogs();
console.log(jsonLogs);

// Export as readable text
const textLogs = window.appwriteLogger.exportLogsAsText();
console.log(textLogs);

// Copy to clipboard (browser)
navigator.clipboard.writeText(textLogs);
```

### Clear Logs

```javascript
window.appwriteLogger.clearLogs()
```

## Log Levels

- **info**: General information about operations
- **warn**: Warnings that don't prevent operation
- **error**: Errors that prevent or fail operations
- **debug**: Detailed debugging information (only in development)

## Log Categories

- **auth**: Authentication operations (login, logout, session checks)
- **database**: Database operations (queries, document retrieval)
- **storage**: Storage operations (file uploads, downloads)
- **api**: General API calls
- **general**: General Appwrite operations

## Example Log Output

```
[2024-01-15 10:30:45] INFO  [AUTH      ] User authenticated {"userId": "abc123"}
[2024-01-15 10:30:46] INFO  [DATABASE  ] ✅ listDocuments(pastPapers) completed in 245ms {"collectionId": "pastPapers", "documentCount": 42, "total": 42}
[2024-01-15 10:30:47] ERROR [DATABASE  ] ❌ listDocuments(users) failed after 5000ms {"collectionId": "users"}
  Error: Permission denied
  Stack: ...
```

## Appwrite CLI Logs

For Appwrite Functions or App Hosting deployments, you can also use the Appwrite CLI:

```bash
# View Appwrite Functions logs
appwrite functions logs

# View Appwrite App Hosting logs
appwrite apphosting logs

# View logs for a specific function
appwrite functions logs --functionId <function-id>
```

## Integration in Code

The logger is automatically integrated into:
- `src/appwrite/index.ts` - Client initialization
- `src/appwrite/provider.tsx` - Authentication operations
- `src/appwrite/database/use-collection.tsx` - Database queries

To add logging to custom Appwrite operations:

```typescript
import { appwriteLogger } from '@/appwrite/logger';

// Log an operation
const startTime = Date.now();
try {
  const result = await databases.createDocument(...);
  appwriteLogger.logApiCall('database', 'createDocument', startTime, true, {
    collectionId: 'pastPapers'
  });
} catch (error) {
  appwriteLogger.logApiCall('database', 'createDocument', startTime, false, {}, error);
}

// Log info
appwriteLogger.info('database', 'Document created', { documentId: result.$id });

// Log warning
appwriteLogger.warn('auth', 'Session expired', { userId: user.$id });

// Log error
appwriteLogger.error('database', 'Failed to delete document', error, { documentId });
```

## Performance Considerations

- Logs are kept in memory (default: last 1000 logs)
- Logging is automatically disabled in production builds
- Console logging only occurs in development mode
- The logger is lightweight and doesn't impact app performance

## Troubleshooting

### No logs appearing in console

1. Make sure you're in development mode (`NODE_ENV=development`)
2. Check that the browser console is open
3. Verify that Appwrite operations are actually being executed
4. Check if logging is enabled: `window.appwriteLogger.setEnabled(true)`

### Too many logs

```javascript
// Disable logging temporarily
window.appwriteLogger.setEnabled(false)

// Filter to see only errors
window.appwriteLogger.getFilteredLogs({ level: 'error' })
```

### Logs not persisting

Logs are stored in memory only and are cleared on page refresh. To persist logs:
1. Export logs before refreshing
2. Use the export functionality to save logs to a file
3. Consider integrating with a logging service for production

## Production Logging

For production environments, consider:
- Integrating with external logging services (Sentry, LogRocket, etc.)
- Using Appwrite's built-in logging features
- Setting up server-side logging for API routes
- Using Appwrite Functions for centralized logging

