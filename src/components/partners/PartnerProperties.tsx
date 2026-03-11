import { Partner } from '@/lib/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import usePropertyStore from '@/stores/usePropertyStore'

export function PartnerProperties({
  partner,
}: {
  partner: Partner
  onUpdate: any
  canEdit: boolean
}) {
  const { properties } = usePropertyStore()

  const linkedProps = properties.filter((p) =>
    partner.linkedPropertyIds?.includes(p.id),
  )

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-4 border-b">
        <div>
          <CardTitle>Linked Properties</CardTitle>
          <CardDescription>
            Properties where this partner provides services.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Property Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linkedProps.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.address}</TableCell>
                <TableCell>
                  <Badge variant="outline">{p.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/properties/${p.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {linkedProps.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No linked properties found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
