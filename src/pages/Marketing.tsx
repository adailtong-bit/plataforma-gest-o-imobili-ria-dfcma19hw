import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Tag, Megaphone, Trash2, Calendar, Workflow } from 'lucide-react'
import useManagementStore from '@/stores/useManagementStore'
import { useToast } from '@/hooks/use-toast'
import { Promotion, Campaign } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarketingAutomation } from '@/components/marketing/MarketingAutomation'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'
import { formatCurrency } from '@/lib/utils'

export default function Marketing() {
  const {
    promotions,
    campaigns,
    addPromotion,
    deletePromotion,
    addCampaign,
    deleteCampaign,
  } = useManagementStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [promoOpen, setPromoOpen] = useState(false)
  const [campOpen, setCampOpen] = useState(false)

  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    code: '',
    type: 'percentage',
    value: 0,
    startDate: '',
    endDate: '',
    active: true,
    description: '',
  })

  const [newCamp, setNewCamp] = useState<Partial<Campaign>>({
    name: '',
    status: 'draft',
    startDate: '',
    endDate: '',
    targetAudience: 'all',
  })

  const handleSavePromo = () => {
    if (!newPromo.code || !newPromo.value) return
    addPromotion({
      ...newPromo,
      id: `promo-${Date.now()}`,
      usageCount: 0,
      active: true,
    } as Promotion)
    setPromoOpen(false)
    toast({
      title: t('common.success'),
      description: 'Discount code created.',
    })
  }

  const handleSaveCamp = () => {
    if (!newCamp.name) return
    addCampaign({
      ...newCamp,
      id: `camp-${Date.now()}`,
      promotions: [],
    } as Campaign)
    setCampOpen(false)
    toast({ title: t('common.success') })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('sidebar.marketing')}
        </h1>
        <p className="text-muted-foreground">{t('marketing_tab.leads')}</p>
      </div>

      <Tabs defaultValue="automation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automation">
            <Workflow className="h-4 w-4 mr-2" /> {t('common.automation')}
          </TabsTrigger>
          <TabsTrigger value="promotions">
            <Tag className="h-4 w-4 mr-2" /> Promotions
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Megaphone className="h-4 w-4 mr-2" /> Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automation">
          <MarketingAutomation />
        </TabsContent>

        <TabsContent value="promotions">
          <div className="flex justify-end mb-4">
            <Dialog open={promoOpen} onOpenChange={setPromoOpen}>
              <DialogTrigger asChild>
                <Button className="bg-trust-blue gap-2">
                  <Plus className="h-4 w-4" /> {t('common.new')} Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Promotion Code</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Code</Label>
                    <Input
                      value={newPromo.code}
                      onChange={(e) =>
                        setNewPromo({
                          ...newPromo,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="SUMMER2024"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('common.type')}</Label>
                      <Select
                        value={newPromo.type}
                        onValueChange={(v: any) =>
                          setNewPromo({ ...newPromo, type: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            Percentage (%)
                          </SelectItem>
                          <SelectItem value="fixed_amount">
                            Fixed Amount ($)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('common.value')}</Label>
                      <Input
                        type="number"
                        value={newPromo.value}
                        onChange={(e) =>
                          setNewPromo({
                            ...newPromo,
                            value: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('common.start_date')}</Label>
                      <Input
                        type="date"
                        value={newPromo.startDate}
                        onChange={(e) =>
                          setNewPromo({
                            ...newPromo,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('common.end_date')}</Label>
                      <Input
                        type="date"
                        value={newPromo.endDate}
                        onChange={(e) =>
                          setNewPromo({ ...newPromo, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('common.description')}</Label>
                    <Input
                      value={newPromo.description}
                      onChange={(e) =>
                        setNewPromo({
                          ...newPromo,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleSavePromo} className="bg-trust-blue">
                    {t('common.save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold font-mono text-lg">
                        <DataMask>{p.code}</DataMask>
                      </TableCell>
                      <TableCell>
                        {p.value}
                        {p.type === 'percentage' ? '%' : '$'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span>{p.startDate}</span>
                          <span>{p.endDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>{p.usageCount}</TableCell>
                      <TableCell>
                        <Badge variant={p.active ? 'default' : 'secondary'}>
                          {p.active
                            ? t('users.status_active')
                            : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePromotion(p.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="flex justify-end mb-4">
            <Dialog open={campOpen} onOpenChange={setCampOpen}>
              <DialogTrigger asChild>
                <Button className="bg-trust-blue gap-2">
                  <Plus className="h-4 w-4" /> {t('common.new')} Campaign
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Campaign</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>{t('common.name')}</Label>
                    <Input
                      value={newCamp.name}
                      onChange={(e) =>
                        setNewCamp({ ...newCamp, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Target Audience</Label>
                    <Select
                      value={newCamp.targetAudience}
                      onValueChange={(v: any) =>
                        setNewCamp({ ...newCamp, targetAudience: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all')}</SelectItem>
                        <SelectItem value="past_guests">Past Guests</SelectItem>
                        <SelectItem value="leads">Leads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveCamp} className="bg-trust-blue">
                    {t('common.save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {campaigns.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{c.name}</CardTitle>
                      <CardDescription>
                        Target: {c.targetAudience}
                      </CardDescription>
                    </div>
                    <Badge>{c.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex gap-2">
                      <Calendar className="h-4 w-4" />
                      {c.startDate || 'TBD'} - {c.endDate || 'TBD'}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCampaign(c.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
