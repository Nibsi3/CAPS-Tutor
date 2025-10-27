import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function PracticePage() {
  return (
    <div className="flex-1 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Adaptive Exam Generator</CardTitle>
          <CardDescription>
            Test your knowledge with custom exams focused on your weak topics.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
            <div className="mx-auto bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                <Target className="w-12 h-12 text-primary" />
            </div>
          <h3 className="text-2xl font-bold font-headline mb-2">Ready for a challenge?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            The AI will create a 5-question test based on your recent performance to help you improve.
          </p>
          <Button size="lg">Generate Custom Exam</Button>
        </CardContent>
      </Card>
    </div>
  )
}
