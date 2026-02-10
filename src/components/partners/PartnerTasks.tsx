import { Card, CardContent } from '@/components/ui/card'

export function PartnerTasks({
  partnerId,
}: {
  partnerId: string
  canEdit: boolean
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-center text-muted-foreground">
          Tasks assigned to this partner.
        </p>
      </CardContent>
    </Card>
  )
}
