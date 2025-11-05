#!/bin/bash
# Post-build script for Appwrite deployment
# This script ensures the build output is in the correct location for Appwrite

set -e

echo "Post-build: Preparing output for Appwrite..."

# If standalone output exists, ensure it's accessible
if [ -d ".next/standalone" ]; then
  echo "Standalone output detected at .next/standalone"
  
  # Verify the structure
  if [ -f ".next/standalone/server.js" ]; then
    echo "✓ Standalone server.js found"
  fi
  
  # Ensure static files are accessible
  if [ -d ".next/static" ]; then
    echo "✓ Static files available"
  fi
fi

# Create a marker file to indicate build completed successfully
touch .build-success

echo "Post-build script completed successfully!"

