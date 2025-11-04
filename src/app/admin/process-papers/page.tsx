'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Loader, Play, CheckCircle, XCircle } from 'lucide-react';

export default function ProcessPastPapersPage() {
    const { user } = useUser();
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleProcess = async () => {
        if (!user) {
            alert('Please log in first');
            return;
        }

        setIsProcessing(true);
        setResult(null);

        try {
            const response = await fetch('/api/process-past-papers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.uid }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Process Past Papers</CardTitle>
                    <CardDescription>
                        Process all past papers from the local directory and upload them to Firestore. 
                        This will scan the "past papers" folder, pair papers with memos, generate questions using AI, and save them to Firestore.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!user && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Please log in to process past papers
                            </p>
                        </div>
                    )}

                    <Button 
                        onClick={handleProcess} 
                        disabled={isProcessing || !user}
                        className="w-full"
                        size="lg"
                    >
                        {isProcessing ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Processing Papers...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Process All Past Papers
                            </>
                        )}
                    </Button>

                    {result && (
                        <Card className={result.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {result.success ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            Processing Complete
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-5 w-5 text-red-600" />
                                            Processing Failed
                                        </>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-2">{result.message || result.error}</p>
                                {result.total !== undefined && (
                                    <div className="space-y-1 text-sm">
                                        <p><strong>Total pairs found:</strong> {result.total}</p>
                                        <p className="text-green-600"><strong>✓ Processed:</strong> {result.processed}</p>
                                        <p className="text-yellow-600"><strong>⊘ Skipped (duplicates):</strong> {result.skipped}</p>
                                        <p className="text-red-600"><strong>✗ Failed:</strong> {result.failed}</p>
                                    </div>
                                )}
                                {result.errors && result.errors.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-semibold mb-2">Errors:</p>
                                        <ul className="list-disc list-inside text-sm space-y-1 max-h-40 overflow-y-auto">
                                            {result.errors.map((error: string, idx: number) => (
                                                <li key={idx} className="text-red-600">{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

