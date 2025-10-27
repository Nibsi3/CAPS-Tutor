import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LessonsPage() {
  return (
    <div className="flex-1 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Lesson Hub</CardTitle>
          <CardDescription>
            Browse and search all available lessons for your grade and subject.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Full lesson content with embedded practice questions will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
