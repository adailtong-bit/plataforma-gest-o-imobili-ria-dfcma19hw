import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import useFinancialStore from '@/stores/useFinancialStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'

export function FinancialSettings() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const { financialSettings, updateFinancialSettings } = useFinancialStore()

  const [settings, setSettings] = useState(financialSettings)

  useEffect(() => {
    setSettings(financialSettings)
  }, [financialSettings])

  const handleSave = () => {
    updateFinancialSettings(settings)
    toast({
      title: 'Settings Saved',
      description: 'Your financial settings have been successfully updated.',
    })
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            Basic financial information about your company.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Company Name</Label>
            <Input
              value={settings.companyName || ''}
              onChange={(e) =>
                setSettings({ ...settings, companyName: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Tax ID (EIN)</Label>
            <Input
              value={settings.ein || ''}
              onChange={(e) =>
                setSettings({ ...settings, ein: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Currency</CardTitle>
          <CardDescription>
            Default currency used across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select
              value={settings.globalCurrency || 'USD'}
              onValueChange={(val: 'USD' | 'BRL' | 'EUR') =>
                setSettings({ ...settings, globalCurrency: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="BRL">BRL (R$)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway</CardTitle>
          <CardDescription>Configure how you receive payments.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Active Provider</Label>
            <Select
              value={settings.gatewayProvider || 'stripe'}
              onValueChange={(val: 'stripe' | 'plaid' | 'manual') =>
                setSettings({ ...settings, gatewayProvider: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="plaid">Plaid</SelectItem>
                <SelectItem value="manual">Manual / Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="production"
              checked={settings.isProduction}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, isProduction: checked })
              }
            />
            <Label htmlFor="production">Production Mode</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} className="bg-trust-blue">
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
