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
      description: t('marketing.new_code'),
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
        <p className="text-muted-foreground">{t('marketing.leads')}</p>
      </div>

      <Tabs defaultValue="automation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automation">
            <Workflow className="h-4 w-4 mr-2" /> {t('marketing.automation')}
          </TabsTrigger>
          <TabsTrigger value="promotions">
            <Tag className="h-4 w-4 mr-2" /> {t('marketing.promotions')}
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Megaphone className="h-4 w-4 mr-2" /> {t('marketing.campaigns')}
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
                  <Plus className="h-4 w-4" /> {t('marketing.new_code')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('marketing.create_promo')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>{t('marketing.code')}</Label>
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
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="fixed_amount">$</SelectItem>
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
                    <TableHead>{t('marketing.code')}</TableHead>
                    <TableHead>{t('marketing.discount')}</TableHead>
                    <TableHead>{t('marketing.validity')}</TableHead>
                    <TableHead>{t('marketing.usage')}</TableHead>
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
                        <DataMask blur={true}>{p.code}</DataMask>
                      </TableCell>
                      <TableCell>
                        <DataMask>
                          {p.value}
                          {p.type === 'percentage' ? '%' : '

`src/pages/MarketAnalysis.tsx`
