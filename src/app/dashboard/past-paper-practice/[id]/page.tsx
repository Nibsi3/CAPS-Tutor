'use client';

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from 'next/navigation';

export default function PastPaperPracticePage() {
    const params = useParams();
    const { id } = params;

    return (
        <div className="flex-1">
            <Card>
                <CardHeader>
                    <CardTitle>Past Paper Practice Session</CardTitle>
                    <p className="text-muted-foreground">Practice session for paper ID: {id}</p>
                </CardHeader>
            </Card>
        </div>
    );
}
