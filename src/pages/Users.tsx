import { Card, CardContent } from '@/components/ui/card'
import { Users as UsersIcon } from 'lucide-react'

export default function Users() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-slate-500">
          <UsersIcon className="h-12 w-12 mb-4 text-slate-300" />
          <p>Manage users and permissions here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
