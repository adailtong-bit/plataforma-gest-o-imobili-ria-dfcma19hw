import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ShortTermReports() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-green-600">
          $12,450
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Occupancy</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-blue-600">
          85%
        </CardContent>
      </Card>
    </div>
  )
}
