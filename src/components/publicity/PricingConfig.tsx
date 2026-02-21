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
import useLanguageStore from '@/stores/useLanguageStore'
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
  const { t } = useLanguageStore()
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
      sidebar: 0,
      footer: 0,
      header: 0,
      performance: 0,
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
          sidebar: adPricing.placementModifiers?.sidebar || 0,
          footer: adPricing.placementModifiers?.footer || 0,
          header: adPricing.placementModifiers?.header || 0,
          performance: adPricing.placementModifiers?.performance || 0,
        },
      })
    }
  }, [adPricing])

  const handleSave = () => {
    updateAdPricing(formData)
    toast({
      title: t('publicity.pricing_config.save_success_title'),
      description: t('publicity.pricing_config.save_success_desc'),
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
          <CardTitle>{t('publicity.pricing_config.title_base')}</CardTitle>
          <CardDescription>
            {t('publicity.pricing_config.desc_base')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                {t('publicity.pricing_config.label_weekly')}
              </Label>
              <CurrencyInput
                value={formData.weekly}
                onChange={(v) => setFormData({ ...formData, weekly: v })}
                currency={currency}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('publicity.pricing_config.label_biweekly')}</Label>
              <CurrencyInput
                value={formData.biWeekly}
                onChange={(v) => setFormData({ ...formData, biWeekly: v })}
                currency={currency}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('publicity.pricing_config.label_monthly')}</Label>
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
            {t('publicity.pricing_config.title_modifiers')}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-64">
                  {t('publicity.pricing_config.tooltip_modifiers')}
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            {t('publicity.pricing_config.desc_modifiers')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1 text-right text-muted-foreground">
                {t('publicity.ads_manager.placements.home_top')}
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
                {t('publicity.ads_manager.placements.home_bottom')}
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
                {t('publicity.ads_manager.placements.partner_page')}
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
                {t('publicity.ads_manager.placements.tenant_page')}
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
                {t('publicity.ads_manager.placements.pm_login') || 'PM Login'}
              </Label>
              <div className="col-span-2">
                <CurrencyInput
                  value={formData.placementModifiers.pm_login}
                  onChange={(v) => updateModifier('pm_login', v)}
                  currency={currency}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1 text-right text-muted-foreground">
                {t('publicity.ads_manager.placements.sidebar') || 'Sidebar'}
              </Label>
              <div className="col-span-2">
                <CurrencyInput
                  value={formData.placementModifiers.sidebar}
                  onChange={(v) => updateModifier('sidebar', v)}
                  currency={currency}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1 text-right text-muted-foreground">
                {t('publicity.ads_manager.placements.footer') || 'Footer'}
              </Label>
              <div className="col-span-2">
                <CurrencyInput
                  value={formData.placementModifiers.footer}
                  onChange={(v) => updateModifier('footer', v)}
                  currency={currency}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1 text-right text-muted-foreground">
                {t('publicity.ads_manager.placements.header') || 'Header'}
              </Label>
              <div className="col-span-2">
                <CurrencyInput
                  value={formData.placementModifiers.header}
                  onChange={(v) => updateModifier('header', v)}
                  currency={currency}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-1 text-right text-muted-foreground">
                {t('publicity.ads_manager.placements.performance') ||
                  'Performance'}
              </Label>
              <div className="col-span-2">
                <CurrencyInput
                  value={formData.placementModifiers.performance}
                  onChange={(v) => updateModifier('performance', v)}
                  currency={currency}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button onClick={handleSave} className="bg-trust-blue gap-2">
              <Save className="h-4 w-4" />{' '}
              {t('publicity.pricing_config.save_btn')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
