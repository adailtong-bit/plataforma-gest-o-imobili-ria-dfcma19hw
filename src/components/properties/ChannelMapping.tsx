import { Property, ChannelMapping as ChannelMappingType } from '@/lib/types'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Link as LinkIcon, Settings2 } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

interface ChannelMappingProps {
  property: Property
}

export function ChannelMapping({ property }: ChannelMappingProps) {
  const { channelMappings, addChannelMapping } = usePropertyStore() // Assume these exist in store
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const mappings = channelMappings.filter((m) => m.propertyId === property.id)

  const handleSync = () => {
    toast({
      title: 'Sync Started',
      description: 'Updating rates and availability...',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" /> Channel Manager Mapping
        </CardTitle>
        <CardDescription>
          Map local rooms to OTA listings (Airbnb, Booking.com, etc).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Sync All
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>OTA Room ID</TableHead>
              <TableHead>Rate Plan ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No active mappings. Configure via Channel Manager settings.
                </TableCell>
              </TableRow>
            ) : (
              mappings.map((map) => (
                <TableRow key={map.id}>
                  <TableCell className="capitalize font-medium">
                    {map.platform}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {map.otaRoomId}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {map.otaRateId || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        map.status === 'mapped' ? 'default' : 'destructive'
                      }
                    >
                      {map.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
