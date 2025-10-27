import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProgressPage() {
  return (
    <div className="flex-1 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Progress Dashboard</CardTitle>
          <CardDescription>
            A detailed view of your learning journey, mastery levels, and performance over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Detailed charts and progress tracking visualizations will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
