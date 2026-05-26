import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useDbTranslations } from '@/hooks/use-db-translations'

export function BulkPricingModal({
  hotelId,
  open,
  onOpenChange,
}: {
  hotelId: string
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [type, setType] = useState('percentage')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useDbTranslations()

  const handleApply = async () => {
    if (!value || isNaN(Number(value))) {
      toast({
        title: 'Error',
        description: 'Please enter a valid number',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const amount = Number(value)

    try {
      const { data: rooms, error: fetchError } = await supabase
        .from('room_types')
        .select('id, base_price')
        .eq('hotel_id', hotelId)

      if (fetchError) throw fetchError

      const updates = rooms.map((room) => {
        let newPrice = Number(room.base_price)
        if (type === 'percentage') {
          newPrice = newPrice * (1 + amount / 100)
        } else if (type === 'fixed_increase') {
          newPrice = newPrice + amount
        } else if (type === 'set_fixed') {
          newPrice = amount
        }
        return { id: room.id, base_price: newPrice }
      })

      // Update one by one or use an RPC
      for (const update of updates) {
        await supabase
          .from('room_types')
          .update({ base_price: update.base_price })
          .eq('id', update.id)
      }

      toast({
        title: t('common.success', 'Success'),
        description: t(
          'pricing.bulk.success',
          'Bulk pricing applied successfully.',
        ),
      })
      onOpenChange(false)
      window.dispatchEvent(new Event('roomTypesUpdated'))
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('pricing.bulk_pricing_engine', 'Bulk Pricing Engine')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'pricing.bulk_desc',
              'Apply a mass price update to all room categories in this hotel. The system will automatically sync prices to all associated rooms.',
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>{t('pricing.adjustment_type', 'Adjustment Type')}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">
                  {t(
                    'pricing.percentage_increase',
                    'Percentage Increase/Decrease (%)',
                  )}
                </SelectItem>
                <SelectItem value="fixed_increase">
                  {t(
                    'pricing.fixed_increase',
                    'Fixed Amount Increase/Decrease ($)',
                  )}
                </SelectItem>
                <SelectItem value="set_fixed">
                  {t('pricing.set_fixed', 'Set Exact Amount ($)')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('pricing.value', 'Value')}</Label>
            <Input
              type="number"
              placeholder={
                type === 'percentage'
                  ? 'e.g., 10 for +10%, -5 for -5%'
                  : 'e.g., 50'
              }
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleApply}
            disabled={loading}
            className="bg-trust-blue text-white"
          >
            {loading
              ? t('pricing.applying', 'Applying...')
              : t('pricing.apply_bulk', 'Apply Bulk Update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
