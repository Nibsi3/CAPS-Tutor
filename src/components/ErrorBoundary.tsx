'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Log error for debugging in Appwrite Console
    console.error("error-boundary-error", error);
    console.error("Error stack:", error?.stack);
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
      env: {
        NEXT_PUBLIC_APPWRITE_ENDPOINT: typeof process !== 'undefined' ? !!process.env?.NEXT_PUBLIC_APPWRITE_ENDPOINT : 'N/A',
        NEXT_PUBLIC_APPWRITE_PROJECT_ID: typeof process !== 'undefined' ? !!process.env?.NEXT_PUBLIC_APPWRITE_PROJECT_ID : 'N/A',
        NEXT_PUBLIC_APPWRITE_DATABASE_ID: typeof process !== 'undefined' ? !!process.env?.NEXT_PUBLIC_APPWRITE_DATABASE_ID : 'N/A',
      }
    });
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error loading page</h1>
            <p className="text-muted-foreground mb-4">
              {process.env.NODE_ENV === 'development' && this.state.error
                ? this.state.error.message
                : 'An error occurred while loading the page.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
