import { useState } from 'react'
import { Property, ChannelLink } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Plus, Trash2, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useLanguageStore from '@/stores/useLanguageStore'
import useShortTermStore from '@/stores/useShortTermStore'
import { addDays } from 'date-fns'
import { formatDate } from '@/lib/utils'

interface PropertySyncProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
}

export function PropertySync({ data, onChange, canEdit }: PropertySyncProps) {
  const { toast } = useToast()
  const { t, language } = useLanguageStore()
  const { addCalendarBlock } = useShortTermStore()
  const [newLink, setNewLink] = useState('')
  const [platform, setPlatform] = useState<
    'airbnb' | 'booking.com' | 'vrbo' | 'other'
  >('airbnb')

  const handleAddLink = () => {
    if (!newLink) return

    const newChannelLink: ChannelLink = {
      id: `link-${Date.now()}`,
      platform,
      url: newLink,
      status: 'pending',
      lastSync: new Date().toISOString(),
    }

    const updatedLinks = [...(data.channelLinks || []), newChannelLink]
    onChange('channelLinks', updatedLinks)
    setNewLink('')
    toast({
      title: t('sync.title'),
      description: t('sync.sync_desc'),
    })
  }

  const handleRemoveLink = (id: string) => {
    const updatedLinks = (data.channelLinks || []).filter((l) => l.id !== id)
    onChange('channelLinks', updatedLinks)
  }

  const handleSyncNow = () => {
    const updatedLinks = (data.channelLinks || []).map((l) => ({
      ...l,
      lastSync: new Date().toISOString(),
      status: 'active' as const,
    }))
    onChange('channelLinks', updatedLinks)

    const startDate = addDays(new Date(), 1).toISOString()
    const endDate = addDays(new Date(), 3).toISOString()

    addCalendarBlock({
      id: `sync-block-${Date.now()}`,
      propertyId: data.id,
      startDate,
      endDate,
      type: 'external_sync',
      notes: `Imported from ${updatedLinks[0]?.platform || 'External'}`,
      source: updatedLinks[0]?.platform || 'External',
    })

    toast({
      title: t('sync.sync_success'),
      description: t('sync.sync_desc'),
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('sync.title')}</CardTitle>
          <CardDescription>{t('sync.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 items-end">
            <div className="grid gap-2 flex-1">
              <Label>{t('sync.platform')}</Label>
              <Select
                value={platform}
                onValueChange={(v: any) => setPlatform(v)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="airbnb">Airbnb (iCal)</SelectItem>
                  <SelectItem value="booking.com">
                    Booking.com (iCal)
                  </SelectItem>
                  <SelectItem value="vrbo">Vrbo (iCal)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 flex-[2]">
              <Label>{t('sync.ical_url')}</Label>
              <Input
                placeholder="https://..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <Button
              onClick={handleAddLink}
              disabled={!canEdit}
              className="bg-trust-blue"
            >
              <Plus className="h-4 w-4 mr-2" /> {t('sync.add_link')}
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sync.platform')}</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>{t('sync.status')}</TableHead>
                  <TableHead>{t('sync.last_sync')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!data.channelLinks || data.channelLinks.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      {t('sync.no_links')}
                    </TableCell>
                  </TableRow>
                )}
                {data.channelLinks?.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="capitalize font-medium">
                      {link.platform}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {link.url}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          link.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {link.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {link.lastSync
                        ? formatDate(link.lastSync, language)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLink(link.id)}
                        disabled={!canEdit}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleSyncNow} className="gap-2">
              <RefreshCw className="h-4 w-4" /> {t('sync.sync_now')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sync.export_calendar')}</CardTitle>
          <CardDescription>
            Share this property's calendar with other platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              readOnly
              value={`https://api.corepm.com/ical/${data.id}.ics`}
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://api.corepm.com/ical/${data.id}.ics`,
                )
                toast({ title: t('sync.copy_link') })
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
