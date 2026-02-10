import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function CommunicationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Replies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Send Welcome Message</Label>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <Label>Send Check-out Instructions</Label>
          <Switch />
        </div>
      </CardContent>
    </Card>
  )
}
