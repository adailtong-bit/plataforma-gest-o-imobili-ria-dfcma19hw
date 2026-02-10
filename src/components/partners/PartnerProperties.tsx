import { Card, CardContent } from '@/components/ui/card'
import { Partner } from '@/lib/types'

export function PartnerProperties({
  partner,
}: {
  partner: Partner
  onUpdate: any
  canEdit: boolean
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-center text-muted-foreground">
          Linked properties list.
        </p>
      </CardContent>
    </Card>
  )
}
