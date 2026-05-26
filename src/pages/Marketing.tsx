import { useContext, useState } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarketingAutomation } from '@/components/marketing/MarketingAutomation'
import { PromotionsManagement } from '@/components/marketing/PromotionsManagement'
import { Campaign } from '@/lib/types'

export default function Marketing() {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign } =
    useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Campaign | null>(null)
  const [form, setForm] = useState({
    name: '',
    targetAudience: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    discountType: 'percentage',
    discountValue: '',
  })

  const handleAdd = () => {
    addCampaign({
      id: `camp-${Date.now()}`,
      name: form.name || 'Nova Campanha',
      targetAudience: (form.targetAudience as any) || 'all',
      startDate: form.startDate || new Date().toISOString().split('T')[0],
      endDate: form.endDate || new Date().toISOString().split('T')[0],
      status: 'active',
      promotions: [],
      imageUrl: form.imageUrl,
      discountType: form.discountType as any,
      discountValue: Number(form.discountValue) || 0,
    })
    setIsAddOpen(false)
    setForm({
      name: '',
      targetAudience: '',
      startDate: '',
      endDate: '',
      imageUrl: '',
      discountType: 'percentage',
      discountValue: '',
    })
    toast({
      title: t('marketing.toast.add_success', 'Campaign successfully added'),
    })
  }

  const handleEdit = () => {
    if (editingRecord) {
      updateCampaign({
        ...editingRecord,
        name: form.name,
        targetAudience:
          (form.targetAudience as any) || editingRecord.targetAudience,
        startDate: form.startDate,
        endDate: form.endDate,
        imageUrl: form.imageUrl,
        discountType: form.discountType as any,
        discountValue: Number(form.discountValue) || 0,
      })
    }
    setEditingRecord(null)
    toast({
      title: t('marketing.toast.edit_success', 'Campaign successfully updated'),
    })
  }

  const handleDelete = (id: string) => {
    deleteCampaign(id)
    toast({
      title: t(
        'marketing.toast.delete_success',
        'Campaign successfully deleted',
      ),
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.marketing')}
          </h1>
          <p className="text-muted-foreground">
            {t('marketing.subtitle', 'Manage marketing features.')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="campaigns">
            {t('marketing.tabs.campaigns', 'Campaigns')}
          </TabsTrigger>
          <TabsTrigger value="promotions">
            {t('marketing.tabs.promotions', 'Promotions')}
          </TabsTrigger>
          <TabsTrigger value="automation">
            {t('marketing.tabs.automation', 'Automation')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-trust-blue gap-2 text-white">
                  <Plus className="h-4 w-4" />{' '}
                  {t('marketing.add_campaign', 'Add Campaign')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {t('marketing.add_campaign', 'Add Campaign')}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 col-span-2">
                    <Label>{t('marketing.form.name', 'Campaign Name')}</Label>
                    <Input
                      placeholder={t(
                        'marketing.form.ph_name',
                        'Ex: Summer Sale',
                      )}
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('marketing.form.target_audience', 'Target Audience')}
                    </Label>
                    <Input
                      placeholder={t(
                        'marketing.form.ph_audience',
                        'Ex: all, leads',
                      )}
                      value={form.targetAudience}
                      onChange={(e) =>
                        setForm({ ...form, targetAudience: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('marketing.form.image_url', 'Image URL (Optional)')}
                    </Label>
                    <Input
                      placeholder={t(
                        'marketing.form.ph_image',
                        'https://example.com/img.jpg',
                      )}
                      value={form.imageUrl}
                      onChange={(e) =>
                        setForm({ ...form, imageUrl: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('marketing.form.start_date', 'Start Date')}
                    </Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('marketing.form.end_date', 'End Date')}</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('marketing.form.discount_type', 'Discount Type')}
                    </Label>
                    <Select
                      value={form.discountType}
                      onValueChange={(v) =>
                        setForm({ ...form, discountType: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          {t('marketing.form.percentage', 'Percentage (%)')}
                        </SelectItem>
                        <SelectItem value="fixed_amount">
                          {t('marketing.form.fixed_amount', 'Fixed Amount ($)')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('marketing.form.discount_value', 'Discount Value')}
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm({ ...form, discountValue: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAdd}>
                    {t('common.save', 'Save')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-16">
                      {t('marketing.table.img', 'Img')}
                    </TableHead>
                    <TableHead>
                      {t('marketing.table.campaign_name', 'Campaign Name')}
                    </TableHead>
                    <TableHead>
                      {t('marketing.table.target_audience', 'Target Audience')}
                    </TableHead>
                    <TableHead>
                      {t('marketing.table.start_date', 'Start Date')}
                    </TableHead>
                    <TableHead>
                      {t('marketing.table.end_date', 'End Date')}
                    </TableHead>
                    <TableHead>
                      {t('marketing.table.discount', 'Discount')}
                    </TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">
                      {t('common.actions', 'Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((camp) => (
                    <TableRow key={camp.id} className="hover:bg-slate-50">
                      <TableCell>
                        {camp.imageUrl ? (
                          <img
                            src={camp.imageUrl}
                            alt="campaign"
                            className="h-10 w-10 rounded-md object-cover border bg-slate-50"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                            {t('common.no_image', 'No Img')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {camp.name}
                      </TableCell>
                      <TableCell className="capitalize">
                        {camp.targetAudience || t('common.all', 'All')}
                      </TableCell>
                      <TableCell>{camp.startDate}</TableCell>
                      <TableCell>{camp.endDate}</TableCell>
                      <TableCell>
                        {camp.discountValue && camp.discountValue > 0 ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700"
                          >
                            {camp.discountType === 'percentage'
                              ? `${camp.discountValue}% OFF`
                              : `$${camp.discountValue} OFF`}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            camp.status === 'active' ? 'default' : 'secondary'
                          }
                        >
                          {camp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={editingRecord?.id === camp.id}
                            onOpenChange={(open) =>
                              !open && setEditingRecord(null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingRecord(camp)
                                  setForm({
                                    name: camp.name,
                                    targetAudience: camp.targetAudience || '',
                                    startDate: camp.startDate,
                                    endDate: camp.endDate,
                                    imageUrl: camp.imageUrl || '',
                                    discountType:
                                      camp.discountType || 'percentage',
                                    discountValue:
                                      camp.discountValue?.toString() || '',
                                  })
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />{' '}
                                {t('common.edit', 'Edit')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {t(
                                    'marketing.edit_campaign',
                                    'Edit Campaign',
                                  )}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2 col-span-2">
                                  <Label>
                                    {t('marketing.form.name', 'Campaign Name')}
                                  </Label>
                                  <Input
                                    placeholder={t(
                                      'marketing.form.name',
                                      'Campaign Name',
                                    )}
                                    value={form.name}
                                    onChange={(e) =>
                                      setForm({ ...form, name: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>
                                    {t(
                                      'marketing.form.target_audience',
                                      'Target Audience',
                                    )}
                                  </Label>
                                  <Input
                                    placeholder={t(
                                      'marketing.form.target_audience',
                                      'Target Audience',
                                    )}
                                    value={form.targetAudience}
                                    onChange={(e) =>
                                      setForm({
                                        ...form,
                                        targetAudience: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>
                                    {t(
                                      'marketing.form.image_url',
                                      'Image URL (Optional)',
                                    )}
                                  </Label>
                                  <Input
                                    placeholder={t(
                                      'marketing.form.ph_image',
                                      'https://example.com/img.jpg',
                                    )}
                                    value={form.imageUrl}
                                    onChange={(e) =>
                                      setForm({
                                        ...form,
                                        imageUrl: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>
                                    {t(
                                      'marketing.form.start_date',
                                      'Start Date',
                                    )}
                                  </Label>
                                  <Input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) =>
                                      setForm({
                                        ...form,
                                        startDate: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>
                                    {t('marketing.form.end_date', 'End Date')}
                                  </Label>
                                  <Input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) =>
                                      setForm({
                                        ...form,
                                        endDate: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>
                                    {t(
                                      'marketing.form.discount_type',
                                      'Discount Type',
                                    )}
                                  </Label>
                                  <Select
                                    value={form.discountType}
                                    onValueChange={(v) =>
                                      setForm({ ...form, discountType: v })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="percentage">
                                        {t(
                                          'marketing.form.percentage',
                                          'Percentage (%)',
                                        )}
                                      </SelectItem>
                                      <SelectItem value="fixed_amount">
                                        {t(
                                          'marketing.form.fixed_amount',
                                          'Fixed Amount ($)',
                                        )}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>
                                    {t(
                                      'marketing.form.discount_value',
                                      'Discount Value',
                                    )}
                                  </Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={form.discountValue}
                                    onChange={(e) =>
                                      setForm({
                                        ...form,
                                        discountValue: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleEdit}>
                                  {t('common.save', 'Save')}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />{' '}
                                {t('common.delete', 'Delete')}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t(
                                    'marketing.delete_campaign',
                                    'Delete Campaign',
                                  )}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    'common.delete_desc',
                                    'This action cannot be undone.',
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t('common.cancel', 'Cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(camp.id)}
                                >
                                  {t('common.delete', 'Delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {campaigns.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-6 text-muted-foreground"
                      >
                        {t('common.empty')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="mt-6">
          <PromotionsManagement />
        </TabsContent>

        <TabsContent value="automation" className="mt-6">
          <MarketingAutomation />
        </TabsContent>
      </Tabs>
    </div>
  )
}
