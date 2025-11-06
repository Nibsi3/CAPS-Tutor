# Appwrite Deployment Package

This directory contains the pre-built Next.js application ready for deployment.

## Structure
- server.js - Application entry point
- .next/static/ - Static assets
- public/ - Public files
- node_modules/ - Production dependencies

## Deployment Instructions

1. Upload this entire directory to Appwrite Storage or your deployment location
2. Set the entry point to: node server.js
3. Set PORT environment variable to 3000
4. Ensure Node.js 20+ is available

## Environment Variables Required

- NEXT_PUBLIC_APPWRITE_ENDPOINT
- NEXT_PUBLIC_APPWRITE_PROJECT_ID
- NEXT_PUBLIC_APPWRITE_DATABASE_ID
- Any other environment variables your app needs

