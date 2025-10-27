import { StatCards } from "@/components/dashboard/StatCards";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome back, Student!</h1>
      </div>
      <StatCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ProgressChart />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity />
        </div>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
          <CardDescription>Pick up where you left off.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div>
              <p className="font-semibold">Grade 8 Mathematics</p>
              <h3 className="text-xl font-bold font-headline">Introduction to Trigonometry</h3>
              <p className="text-sm text-muted-foreground mt-1">Lesson 3 of 12</p>
            </div>
            <Button>Resume Lesson</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
