'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";

export default function PastPaperPracticePage() {
  const params = useParams();
  const { id } = params;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Past Paper Practice Session</CardTitle>
          <CardDescription>Paper ID: {id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Page content will be built here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
