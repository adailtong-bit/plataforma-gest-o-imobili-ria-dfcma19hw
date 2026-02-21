import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, TrendingUp, Calendar } from 'lucide-react'
import { Property, RatePlan } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import usePropertyStore from '@/stores/usePropertyStore'
import useLanguageStore from '@/stores/useLanguageStore'

interface RatePlanManagerProps {
  property: Property
}

export function RatePlanManager({ property }: RatePlanManagerProps) {
  const { updateProperty } = usePropertyStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Partial<RatePlan>>({
    name: '',
    type: 'seasonal',
    adjustmentType: 'percentage',
    adjustmentValue: 0,
    active: true,
  })

  const handleSave = () => {
    if (!editingPlan.name) return

    let updatedPlans = property.ratePlans ? [...property.ratePlans] : []

    if (editingPlan.id) {
      updatedPlans = updatedPlans.map((p) =>
        p.id === editingPlan.id ? (editingPlan as RatePlan) : p,
      )
    } else {
      updatedPlans.push({
        ...editingPlan,
        id: `rp-${Date.now()}`,
      } as RatePlan)
    }

    updateProperty({ ...property, ratePlans: updatedPlans })
    setIsOpen(false)
    setEditingPlan({
      name: '',
      type: 'seasonal',
      adjustmentType: 'percentage',
      adjustmentValue: 0,
      active: true,
    })
    toast({ title: t('common.success') })
  }

  const handleDelete = (id: string) => {
    const updatedPlans = property.ratePlans?.filter((p) => p.id !== id) || []
    updateProperty({ ...property, ratePlans: updatedPlans })
    toast({ title: t('common.delete_success') })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {t('properties.tabs.pricing')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('settings.automation_desc')}
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> {t('common.add_title')}
        </Button>
      </div>

      <div className="grid gap-4">
        {property.ratePlans?.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Badge variant={plan.active ? 'default' : 'secondary'}>
                  {plan.type}
                </Badge>
                <CardTitle className="text-base">{plan.name}</CardTitle>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingPlan(plan)
                    setIsOpen(true)
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm grid gap-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('common.value')}:
                </span>
                <span className="font-bold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {plan.adjustmentValue > 0 ? '+' : ''}
                  {plan.adjustmentValue}
                  {plan.adjustmentType === 'percentage' ? '%' : '$'}
                </span>
              </div>
              {plan.startDate && plan.endDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('common.date')}:
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {plan.startDate}{' '}
                    {t('common.and')} {plan.endDate}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {(!property.ratePlans || property.ratePlans.length === 0) && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            {t('common.empty')}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlan.id ? t('common.edit') : t('common.new')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('common.name')}</Label>
              <Input
                value={editingPlan.name}
                onChange={(e) =>
                  setEditingPlan({ ...editingPlan, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('common.type')}</Label>
                <Select
                  value={editingPlan.type}
                  onValueChange={(v: any) =>
                    setEditingPlan({ ...editingPlan, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seasonal">
                      {t('guest_services.seasonal_pricing')}
                    </SelectItem>
                    <SelectItem value="holiday">{t('common.other')}</SelectItem>
                    <SelectItem value="long_stay">
                      {t('properties.profile_long')}
                    </SelectItem>
                    <SelectItem value="last_minute">
                      {t('common.other')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('common.status')}</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={editingPlan.active}
                    onCheckedChange={(c) =>
                      setEditingPlan({ ...editingPlan, active: c })
                    }
                  />
                  <span>
                    {editingPlan.active
                      ? t('common.active')
                      : t('common.inactive')}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('common.type')}</Label>
                <Select
                  value={editingPlan.adjustmentType}
                  onValueChange={(v: any) =>
                    setEditingPlan({ ...editingPlan, adjustmentType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed_price">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('common.value')} (+ / -)</Label>
                <Input
                  type="number"
                  value={editingPlan.adjustmentValue}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      adjustmentValue: Number(e.target.value),
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
                  value={editingPlan.startDate}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('common.end_date')}</Label>
                <Input
                  type="date"
                  value={editingPlan.endDate}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
