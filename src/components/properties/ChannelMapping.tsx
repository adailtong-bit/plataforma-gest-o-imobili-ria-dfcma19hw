import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Plus, Trash2 } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import { ChannelMapping, Property } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'

interface ChannelMappingProps {
  property: Property
}

export function ChannelMapping({ property }: ChannelMappingProps) {
  const {
    channelMappings,
    addChannelMapping,
    deleteChannelMapping,
    updateChannelMapping,
  } = usePropertyStore()
  const { toast } = useToast()

  const [platform, setPlatform] = useState<'airbnb' | 'booking.com' | 'vrbo'>(
    'airbnb',
  )
  const [otaRoomId, setOtaRoomId] = useState('')
  const [localType, setLocalType] = useState(property.type)

  const mappings = channelMappings.filter((m) => m.propertyId === property.id)

  const handleAddMapping = () => {
    if (!otaRoomId) return

    addChannelMapping({
      id: `map-${Date.now()}`,
      propertyId: property.id,
      platform,
      otaRoomId,
      localRoomTypeId: localType,
      status: 'pending',
    })
    setOtaRoomId('')
    toast({ title: 'Mapping Added' })
  }

  const handleSync = (mapping: ChannelMapping) => {
    // Mock Sync
    updateChannelMapping({
      ...mapping,
      status: 'mapped',
      lastSync: new Date().toISOString(),
    })
    toast({
      title: 'Availability Synced',
      description: `Updated ${mapping.platform}`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced OTA Mapping</CardTitle>
        <CardDescription>
          Link local room types to external channel IDs for real-time sync.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4 items-end border p-4 rounded-lg bg-slate-50">
          <div className="grid gap-2 flex-1">
            <span className="text-sm font-medium">Platform</span>
            <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="booking.com">Booking.com</SelectItem>
                <SelectItem value="vrbo">Vrbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 flex-1">
            <span className="text-sm font-medium">OTA Room ID</span>
            <Input
              value={otaRoomId}
              onChange={(e) => setOtaRoomId(e.target.value)}
              placeholder="e.g. 12345678"
            />
          </div>
          <Button onClick={handleAddMapping} className="bg-trust-blue gap-2">
            <Plus className="h-4 w-4" /> Add Map
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>OTA ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Sync</TableHead>
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
                  No active mappings.
                </TableCell>
              </TableRow>
            ) : (
              mappings.map((map) => (
                <TableRow key={map.id}>
                  <TableCell className="capitalize font-medium">
                    {map.platform}
                  </TableCell>
                  <TableCell className="font-mono">{map.otaRoomId}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        map.status === 'mapped' ? 'default' : 'secondary'
                      }
                    >
                      {map.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {map.lastSync ? formatDate(map.lastSync) : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(map)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Sync
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteChannelMapping(map.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
