import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account, notification, and theme preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>User settings and preferences will be managed from this page.</p>
        </CardContent>
      </Card>
    </div>
  )
}
