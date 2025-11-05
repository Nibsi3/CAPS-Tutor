#!/bin/bash
# Build verification script for Appwrite deployment
# This script verifies that the build completed successfully and outputs are in the expected location

set -e

echo "Verifying Next.js build output..."

# Check if .next directory exists
if [ ! -d ".next" ]; then
  echo "ERROR: .next directory not found"
  exit 1
fi

# Check if standalone output exists (for standalone mode)
if [ -d ".next/standalone" ]; then
  echo "✓ Standalone output found at .next/standalone"
  
  # Check for server.js (entry point)
  if [ ! -f ".next/standalone/server.js" ]; then
    echo "WARNING: server.js not found in .next/standalone"
  else
    echo "✓ server.js found"
  fi
  
  # Check for static files
  if [ -d ".next/static" ]; then
    echo "✓ Static files found at .next/static"
  else
    echo "WARNING: .next/static directory not found"
  fi
else
  echo "INFO: Standalone output not found (may not be using standalone mode)"
fi

# Check for public directory
if [ -d "public" ]; then
  echo "✓ Public directory found"
else
  echo "WARNING: Public directory not found"
fi

echo "Build verification complete!"

