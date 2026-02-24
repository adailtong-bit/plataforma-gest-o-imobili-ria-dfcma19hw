import { Card, CardContent } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

export default function Financial() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Financial</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-slate-500">
          <DollarSign className="h-12 w-12 mb-4 text-slate-300" />
          <p>Manage your transactions and invoices here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
