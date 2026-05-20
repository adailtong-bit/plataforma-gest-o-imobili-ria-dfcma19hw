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

export function BulkPricingModal({
  open,
  onOpenChange,
  onUpdated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onUpdated: () => void
}) {
  const [type, setType] = useState('percentage')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

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
      const { data: properties, error: fetchError } = await supabase
        .from('properties')
        .select('id, listing_price')

      if (fetchError) throw fetchError

      const updates = properties.map((prop) => {
        let newPrice = Number(prop.listing_price || 0)
        if (type === 'percentage') {
          newPrice = newPrice * (1 + amount / 100)
        } else if (type === 'fixed_increase') {
          newPrice = newPrice + amount
        } else if (type === 'set_fixed') {
          newPrice = amount
        }
        return { id: prop.id, listing_price: newPrice }
      })

      for (const update of updates) {
        await supabase
          .from('properties')
          .update({ listing_price: update.listing_price })
          .eq('id', update.id)
      }

      toast({
        title: 'Success',
        description: 'Bulk pricing applied successfully.',
      })
      onOpenChange(false)
      onUpdated()
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
          <DialogTitle>Bulk Pricing Engine</DialogTitle>
          <DialogDescription>
            Apply a mass price update to all properties.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">
                  Percentage Increase/Decrease (%)
                </SelectItem>
                <SelectItem value="fixed_increase">
                  Fixed Amount Increase/Decrease ($)
                </SelectItem>
                <SelectItem value="set_fixed">Set Exact Amount ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
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
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={loading}
            className="bg-trust-blue text-white"
          >
            {loading ? 'Applying...' : 'Apply Bulk Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
