import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import usePublicityStore from '@/stores/usePublicityStore'
import { useToast } from '@/hooks/use-toast'

export function PricingConfig() {
  const { adPricing, updateAdPricing } = usePublicityStore()
  const { toast } = useToast()
  const [prices, setPrices] = useState(adPricing)

  // Sync state if store updates
  useEffect(() => {
    setPrices(adPricing)
  }, [adPricing])

  const handleSave = () => {
    updateAdPricing(prices)
    toast({
      title: 'Configuration Saved',
      description: 'Advertisement pricing updated successfully.',
    })
  }

  const handleChange = (field: keyof typeof prices, value: string) => {
    setPrices((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advertisement Pricing Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="grid gap-2">
            <Label>Weekly Rate ($)</Label>
            <Input
              type="number"
              value={prices.weekly ?? 0}
              onChange={(e) => handleChange('weekly', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Bi-Weekly Rate ($)</Label>
            <Input
              type="number"
              value={prices.biWeekly ?? 0}
              onChange={(e) => handleChange('biWeekly', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Monthly Rate ($)</Label>
            <Input
              type="number"
              value={prices.monthly ?? 0}
              onChange={(e) => handleChange('monthly', e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-trust-blue">
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
