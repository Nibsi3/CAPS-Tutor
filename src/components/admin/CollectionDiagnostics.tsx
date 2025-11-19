'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, CheckCircle2, XCircle, AlertCircle, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CollectionInfo {
  id: string;
  name: string;
  $createdAt?: string;
  $updatedAt?: string;
}

interface FoundCollection {
  expectedId: string;
  found: boolean;
  actualId: string | null;
  actualName: string | null;
}

interface CollectionDiagnosticsData {
  success: boolean;
  databaseId: string;
  totalCollections: number;
  collections: CollectionInfo[];
  expectedCollections: string[];
  foundCollections: FoundCollection[];
  similarCollections: Array<{ id: string; name: string }>;
  missingCollections: string[];
  diagnostic: {
    message: string;
    instructions: string[];
  };
  error?: string;
  message?: string;
}

export function CollectionDiagnostics() {
  const [data, setData] = useState<CollectionDiagnosticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCollections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/debug/check-collections');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to check collections');
      }
      
      setData(result);
    } catch (err: any) {
      console.error('Error checking collections:', err);
      setError(err.message || 'Failed to check collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCollections();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collection Diagnostics</CardTitle>
          <CardDescription>Checking Appwrite database collections...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Collection Diagnostics Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkCollections} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const allFound = data.foundCollections.every(f => f.found);
  const someMissing = data.missingCollections.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Collection Diagnostics</CardTitle>
              <CardDescription>
                Database: <code className="text-xs bg-muted px-2 py-1 rounded">{data.databaseId}</code>
              </CardDescription>
            </div>
            <Button onClick={checkCollections} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Summary */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            {allFound ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-600">All Collections Found</p>
                  <p className="text-sm text-muted-foreground">
                    {data.totalCollections} collection(s) found in database
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-600">Missing Collections Detected</p>
                  <p className="text-sm text-muted-foreground">
                    {data.missingCollections.length} expected collection(s) not found
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Expected Collections Status */}
          <div>
            <h3 className="font-semibold mb-3">Expected Collections</h3>
            <div className="space-y-2">
              {data.foundCollections.map((found, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {found.found ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">Expected: <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{found.expectedId}</code></p>
                      {found.found && found.actualId ? (
                        <p className="text-sm text-muted-foreground">
                          Found: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{found.actualId}</code>
                          {found.actualName && found.actualName !== found.actualId && (
                            <span> ({found.actualName})</span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">Not found</p>
                      )}
                    </div>
                  </div>
                  {found.found && found.actualId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(found.actualId!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* All Collections List */}
          <div>
            <h3 className="font-semibold mb-3">
              All Collections ({data.totalCollections})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.collections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-2 rounded border text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{collection.id}</Badge>
                    {collection.name && collection.name !== collection.id && (
                      <span className="text-muted-foreground">{collection.name}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(collection.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Similar Collections Warning */}
          {data.similarCollections.length > 0 && someMissing && (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Similar Collections Found
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                    These collections might be the ones you're looking for (check for case sensitivity):
                  </p>
                  <div className="space-y-1">
                    {data.similarCollections.map((collection, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <code className="text-xs bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded">
                          {collection.id}
                        </code>
                        {collection.name && collection.name !== collection.id && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            ({collection.name})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {someMissing && (
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-semibold mb-2">How to Fix Missing Collections:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {data.diagnostic.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
              <div className="mt-4 p-3 rounded bg-background border">
                <p className="text-sm font-medium mb-2">Quick Action:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `https://cloud.appwrite.io/console/database/${data.databaseId}/collections`;
                      window.open(url, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Appwrite Console
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(data.databaseId)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Database ID
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Message */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {data.diagnostic.message}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
