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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MultiSelect, OptionType } from '@/components/ui/multi-select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Promotion } from '@/lib/types'

export function PromotionsManagement() {
  const {
    promotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    properties,
    hotels,
    formatAppCurrency,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Promotion | null>(null)

  const defaultForm: Partial<Promotion> = {
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    targetType: 'all',
    targetId: 'none',
    scope: 'global',
    roomIds: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    active: true,
  }

  const [form, setForm] = useState<Partial<Promotion>>(defaultForm)

  const getTargetLabel = (type?: string, id?: string) => {
    if (type === 'all' || !type) return t('common.all')
    if (type === 'property') {
      const prop = properties.find((p) => p.id === id)
      return prop ? prop.name : id
    }
    if (type === 'hotel') {
      const hotel = hotels.find((h) => h.id === id)
      return hotel ? hotel.name : id
    }
    return id
  }

  const availableRooms: OptionType[] =
    form.targetType === 'hotel'
      ? properties
          .filter((p) => p.hotelId === form.targetId)
          .map((p) => ({ label: p.name, value: p.id }))
      : form.targetType === 'property' && form.targetId !== 'none'
        ? properties
            .filter((p) => p.id === form.targetId)
            .map((p) => ({ label: p.name, value: p.id }))
        : []

  const handleSave = () => {
    if (!form.code || form.value === undefined) {
      toast({
        title: t('common.error'),
        description: t('common.validation_error'),
        variant: 'destructive',
      })
      return
    }

    const payload: Promotion = {
      ...defaultForm,
      ...(editingRecord || { id: `promo-${Date.now()}`, usageCount: 0 }),
      ...form,
      value: Number(form.value),
    } as Promotion

    if (editingRecord) {
      updatePromotion(payload)
      toast({ title: t('common.success') })
    } else {
      addPromotion(payload)
      toast({ title: t('common.success') })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm(defaultForm)
  }

  const handleDelete = (id: string) => {
    deletePromotion(id)
    toast({ title: t('common.delete_success') })
  }

  const openEdit = (promo: Promotion) => {
    setEditingRecord(promo)
    setForm({
      code: promo.code,
      description: promo.description || '',
      type: promo.type,
      value: promo.value,
      targetType: promo.targetType || 'all',
      targetId: promo.targetId || 'none',
      scope: promo.scope || 'global',
      roomIds: promo.roomIds || [],
      startDate: promo.startDate,
      endDate: promo.endDate,
      active: promo.active,
    })
    setIsAddOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {t('marketing.promotions')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('marketing.manage_promotions')}
          </p>
        </div>
        <Dialog
          open={isAddOpen}
          onOpenChange={(v) => {
            setIsAddOpen(v)
            if (!v) {
              setEditingRecord(null)
              setForm(defaultForm)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2 text-white">
              <Plus className="h-4 w-4" /> {t('common.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? t('common.edit') : t('common.add')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('marketing.code')}</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. SUMMER20"
                  />
                </div>
                <div className="space-y-2 flex items-end pb-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.active}
                      onCheckedChange={(c) => setForm({ ...form, active: c })}
                    />
                    <Label>{t('common.active')}</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('common.description')}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('marketing.discount_type')}</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v: any) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('marketing.discount_value')} (
                    {form.type === 'percentage' ? '%' : '$'})
                  </Label>
                  <Input
                    type="number"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('common.start_date')}</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.end_date')}</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('marketing.target')}</Label>
                <Select
                  value={form.targetType}
                  onValueChange={(v: any) =>
                    setForm({ ...form, targetType: v, targetId: 'none' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="hotel">{t('common.hotels')}</SelectItem>
                    <SelectItem value="property">
                      {t('common.properties')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.targetType !== 'all' && (
                <div className="space-y-2">
                  <Label>
                    Select{' '}
                    {form.targetType === 'hotel'
                      ? t('common.hotels')
                      : t('common.properties')}
                  </Label>
                  <Select
                    value={form.targetId}
                    onValueChange={(v) => setForm({ ...form, targetId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t('common.select')}...
                      </SelectItem>
                      {form.targetType === 'hotel' &&
                        hotels.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name}
                          </SelectItem>
                        ))}
                      {form.targetType === 'property' &&
                        properties.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.targetType !== 'all' && form.targetId !== 'none' && (
                <div className="space-y-2">
                  <Label>Scope</Label>
                  <Select
                    value={form.scope}
                    onValueChange={(v: any) =>
                      setForm({ ...form, scope: v, roomIds: [] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">
                        General / All Rooms
                      </SelectItem>
                      <SelectItem value="specific_rooms">
                        Specific Rooms
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.scope === 'specific_rooms' &&
                form.targetId !== 'none' &&
                availableRooms.length > 0 && (
                  <div className="space-y-2">
                    <Label>Specific Rooms</Label>
                    <MultiSelect
                      options={availableRooms}
                      selected={form.roomIds || []}
                      onChange={(selected) =>
                        setForm({ ...form, roomIds: selected })
                      }
                      placeholder="Select rooms..."
                    />
                  </div>
                )}
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id} className="hover:bg-slate-50">
                  <TableCell className="font-bold text-slate-900">
                    {promo.code}
                    {promo.description && (
                      <p className="text-xs text-muted-foreground font-normal line-clamp-1">
                        {promo.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {getTargetLabel(promo.targetType, promo.targetId)}
                      </span>
                      {promo.scope === 'specific_rooms' &&
                        promo.roomIds &&
                        promo.roomIds.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {promo.roomIds.length} specific rooms
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {promo.type === 'percentage'
                        ? `${promo.value}%`
                        : formatAppCurrency(promo.value)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {promo.startDate} - {promo.endDate}
                  </TableCell>
                  <TableCell>{promo.usageCount}</TableCell>
                  <TableCell>
                    <Badge variant={promo.active ? 'default' : 'outline'}>
                      {promo.active ? t('common.active') : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(promo)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('common.confirm_delete')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('common.delete_desc')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(promo.id)}
                            >
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {promotions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
    </div>
  )
}
