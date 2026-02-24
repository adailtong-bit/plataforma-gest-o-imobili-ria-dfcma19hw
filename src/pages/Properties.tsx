import { Card, CardContent } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export default function Properties() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-slate-500">
          <Building2 className="h-12 w-12 mb-4 text-slate-300" />
          <p>Manage your properties here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
