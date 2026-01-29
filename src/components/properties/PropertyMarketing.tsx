import { useState } from 'react'
import { Property, Lead } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Share2,
  Globe,
  Loader2,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface PropertyMarketingProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
}

export function PropertyMarketing({
  data,
  onChange,
  canEdit,
}: PropertyMarketingProps) {
  const { t, language } = useLanguageStore()
  const { toast } = useToast()
  const [isPublishing, setIsPublishing] = useState(false)

  // Portal Settings handlers
  const handlePortalToggle = (
    portal: 'zillow' | 'idealista',
    enabled: boolean,
  ) => {
    const currentSettings = data.portalSettings || {
      zillow: false,
      idealista: false,
    }
    onChange('portalSettings', { ...currentSettings, [portal]: enabled })

    if (enabled) {
      toast({
        title: 'Sync Enabled',
        description: `Synchronization with ${portal === 'zillow' ? 'Zillow' : 'Idealista'} active.`,
      })
    }
  }

  const handlePublish = () => {
    if (!data.portalSettings?.zillow && !data.portalSettings?.idealista) {
      toast({
        title: t('common.error'),
        description: 'Please enable at least one portal.',
        variant: 'destructive',
      })
      return
    }

    setIsPublishing(true)
    // Simulate API Call
    setTimeout(() => {
      setIsPublishing(false)
      toast({
        title: t('common.success'),
        description: t('marketing_tab.publish_success'),
      })
    }, 2000)
  }

  // Helper for Leads
  const leads = data.leads || []

  return (
    <div className="space-y-6">
      {/* Portal Sync Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> {t('marketing_tab.portal_sync')}
          </CardTitle>
          <CardDescription>
            Manage automated listings on major real estate platforms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                Z
              </div>
              <div>
                <p className="font-semibold">Zillow</p>
                <p className="text-sm text-muted-foreground">
                  US Market Leader
                </p>
              </div>
            </div>
            <Switch
              checked={data.portalSettings?.zillow || false}
              onCheckedChange={(c) => handlePortalToggle('zillow', c)}
              disabled={!canEdit}
            />
          </div>

          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-yellow-400 rounded-md flex items-center justify-center text-black font-bold">
                i
              </div>
              <div>
                <p className="font-semibold">Idealista</p>
                <p className="text-sm text-muted-foreground">European Market</p>
              </div>
            </div>
            <Switch
              checked={data.portalSettings?.idealista || false}
              onCheckedChange={(c) => handlePortalToggle('idealista', c)}
              disabled={!canEdit}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handlePublish}
              disabled={!canEdit || isPublishing}
              className="bg-trust-blue w-full sm:w-auto"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                  Publishing...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />{' '}
                  {t('marketing_tab.publish_btn')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Centralized Lead Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> {t('marketing_tab.leads')}
          </CardTitle>
          <CardDescription>
            Inquiries captured from external portals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('marketing_tab.contact_info')}</TableHead>
                  <TableHead>{t('marketing_tab.source')}</TableHead>
                  <TableHead>{t('marketing_tab.inquiry_date')}</TableHead>
                  <TableHead>{t('marketing_tab.status')}</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No leads yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span>{lead.email}</span>
                          <span className="text-muted-foreground">
                            {lead.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            lead.source === 'Zillow'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : lead.source === 'Idealista'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : ''
                          }
                        >
                          {lead.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(lead.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lead.status === 'new' ? 'default' : 'secondary'
                          }
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
