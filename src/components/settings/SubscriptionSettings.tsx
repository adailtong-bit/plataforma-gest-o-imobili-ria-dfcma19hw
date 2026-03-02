import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function SubscriptionSettings() {
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
        <CardDescription>Manage your billing and tier limits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div>
            <h3 className="font-bold text-blue-900">Pro Plan</h3>
            <p className="text-sm text-blue-700">
              Unlimited users, up to 50 properties.
            </p>
          </div>
          <Badge className="bg-blue-600 text-white hover:bg-blue-700">
            Active
          </Badge>
        </div>
        <p className="text-sm text-slate-500">
          Contact support to upgrade your plan or increase your property limits.
        </p>
      </CardContent>
    </Card>
  )
}
