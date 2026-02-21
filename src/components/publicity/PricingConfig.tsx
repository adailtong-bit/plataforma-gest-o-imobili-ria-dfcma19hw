import { useState, useEffect, useContext } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Save, HelpCircle } from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import { AppContext } from '@/stores/AppContext'
import { useToast } from '@/hooks/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function PricingConfig() {
  const { adPricing, updateAdPricing } = usePublicityStore()
  const appContext = useContext(AppContext)
  const currency = appContext?.currency || 'USD'
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    weekly: 0,
    biWeekly: 0,
    monthly: 0,
    placementModifiers: {
      home_top: 0,
      home_bottom: 0,
      partner_page: 0,
      tenant_page: 0,
      pm_login: 0,
    },
  })

  useEffect(() => {
    if (adPricing) {
      setFormData({
        weekly: adPricing.weekly || 0,
        biWeekly: adPricing.biWeekly || 0,
        monthly: adPricing.monthly || 0,
        placementModifiers: {
          home_top: adPricing.placementModifiers?.home_top || 0,
          home_bottom: adPricing.placementModifiers?.home_bottom || 0,
          partner_page: adPricing.placementModifiers?.partner_page || 0,
          tenant_page: adPricing.placementModifiers?.tenant_page || 0,
          pm_login: adPricing.placementModifiers?.pm_login || 0,
        },
      })
    }
  }, [adPricing])

  const handleSave = () => {
    updateAdPricing(formData)
    toast({
      title: 'Pricing Configuration Saved',
      description: 'Your ad rates have been updated successfully.',
    })
  }

  const updateModifier = (key: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      placementModifiers: {
        ...prev.placementModifiers,
        [key]: value,
      },
    }))
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Base Duration Rates</CardTitle>
          <CardDescription>
            Set the standard pricing for different advertisement durations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">Weekly Rate</Label>
              <CurrencyInput
                value={formData.weekly}
                onChange={(v) => setFormData({ ...formData, weekly: v })}
                currency={currency}
              />
            </div>
            <div className="grid gap-2">
              <Label>Bi-Weekly Rate (14 Days)</Label>
              <CurrencyInput
                value={formData.biWeekly}
                onChange={(v) => setFormData({ ...formData, biWeekly: v })}
                currency={currency}
              />
            </div>
            <div className="grid gap-2">
              <Label>Monthly Rate</Label>
              <CurrencyInput
                value={formData.monthly}
                onChange={(v) => setFormData({ ...formData, monthly: v })}
                currency={currency}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Placement Modifiers
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-64">
                  These values represent fixed additions to the base duration
                  rate depending on where the ad is placed.
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            Additional costs for premium placements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1 text-right text-muted-foreground">
                Home Top Banner
              </Label>
              <div className="col-span-2">
                <CurrencyInput
                  value={formData.placementModifiers.home_top}
                  onChange={(v) => updateModifier('home_top', v)}
                  currency={currency}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1 text-right text-muted-foreground">
                Home Bottom
              </Label>
              <div className="col-span-2">
                <CurrencyInput
                  value={formData.placementModifiers.home_bottom}
                  onChange={(v) => updateModifier('home_bottom', v)}
                  currency={currency}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1 text-right text-muted-foreground">
                Partner Page
              </Label>
              <div className="col-span-2">
                <CurrencyInput
                  value={formData.placementModifiers.partner_page}
                  onChange={(v) => updateModifier('partner_page', v)}
                  currency={currency}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1 text-right text-muted-foreground">
                Tenant Portal
              </Label>
              <div className="col-span-2">
                <CurrencyInput
                  value={formData.placementModifiers.tenant_page}
                  onChange={(v) => updateModifier('tenant_page', v)}
                  currency={currency}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1 text-right text-muted-foreground">
                PM Login Screen
              </Label>
              <div className="col-span-2">
                <CurrencyInput
                  value={formData.placementModifiers.pm_login}
                  onChange={(v) => updateModifier('pm_login', v)}
                  currency={currency}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button onClick={handleSave} className="bg-trust-blue gap-2">
              <Save className="h-4 w-4" /> Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
