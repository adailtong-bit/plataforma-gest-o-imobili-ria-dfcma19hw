import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useLanguageStore from '@/stores/useLanguageStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { AuditLogList } from '@/components/audit/AuditLogList'
import { User, FinancialSettings, AlertConfig } from '@/lib/types'
import useUserStore from '@/stores/useUserStore'
import {
  Globe,
  CreditCard,
  Building,
  CheckCircle,
  RefreshCw,
  Mail,
  Bell,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Settings() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const { financialSettings, updateFinancialSettings } = useFinancialStore()
  const { currentUser } = useAuthStore()
  const { updateUser } = useUserStore()
  const [financialData, setFinancialData] =
    useState<FinancialSettings>(financialSettings)
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    taxId: (currentUser as User).taxId || '',
    address: (currentUser as User).address || '',
    phone: currentUser.phone || '',
  })

  // Mock Channel States
  const [channelStatus, setChannelStatus] = useState({
    airbnb: { connected: true, lastSync: '2 minutes ago', status: 'Healthy' },
    booking: { connected: true, lastSync: '15 minutes ago', status: 'Healthy' },
    vrbo: { connected: false, lastSync: 'Never', status: 'Disconnected' },
  })

  // Initialize alerts if missing
  const defaultAlerts: AlertConfig[] = [
    {
      id: 'a1',
      trigger: 'price_threshold',
      frequency: 'daily',
      enabled: true,
      label: t('settings.trigger_price'),
    },
    {
      id: 'a2',
      trigger: 'upcoming_booking',
      frequency: 'immediate',
      enabled: true,
      label: t('settings.trigger_booking'),
    },
    {
      id: 'a3',
      trigger: 'new_task',
      frequency: 'immediate',
      enabled: false,
      label: t('settings.trigger_task'),
    },
    {
      id: 'a4',
      trigger: 'low_inventory',
      frequency: 'weekly',
      enabled: true,
      label: t('settings.trigger_inventory'),
    },
  ]

  const [alerts, setAlerts] = useState<AlertConfig[]>(
    financialData.alertPreferences || defaultAlerts,
  )

  const handleFinancialSave = () => {
    updateFinancialSettings({ ...financialData, alertPreferences: alerts })
    toast({
      title: t('common.save'),
      description: 'Configurações financeiras e alertas atualizados.',
    })
  }

  const handleProfileSave = () => {
    updateUser({
      ...(currentUser as User),
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      taxId: profileData.taxId,
      address: profileData.address,
    })
    toast({
      title: t('common.save'),
      description: 'Perfil atualizado com sucesso.',
    })
  }

  const handleFinancialChange = (field: string, value: any) => {
    setFinancialData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleChannel = (channel: 'airbnb' | 'booking' | 'vrbo') => {
    setChannelStatus((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        connected: !prev[channel].connected,
        status: !prev[channel].connected ? 'Healthy' : 'Disconnected',
        lastSync: !prev[channel].connected ? 'Just now' : 'Disconnected',
      },
    }))
    toast({
      title: 'Channel Updated',
      description: `${channel.charAt(0).toUpperCase() + channel.slice(1)} integration ${!channelStatus[channel].connected ? 'enabled' : 'disabled'}.`,
    })
  }

  const handleAlertChange = (
    id: string,
    field: keyof AlertConfig,
    value: any,
  ) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, [field]: value } : alert,
      ),
    )
  }

  const isPlatformOwner = currentUser.role === 'platform_owner'
  const canViewAudit =
    hasPermission(currentUser as User, 'audit_logs', 'view') || isPlatformOwner

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile">{t('common.profile')}</TabsTrigger>
          <TabsTrigger value="integrations">
            {t('settings.integrations')}
          </TabsTrigger>
          <TabsTrigger value="billing">Billing & Payment</TabsTrigger>
          <TabsTrigger value="notifications">
            {t('common.notifications')}
          </TabsTrigger>
          {canViewAudit && (
            <TabsTrigger value="audit">
              {t('common.system_activity')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.personal_info')}</CardTitle>
              <CardDescription>{t('settings.update_info')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="outline">{t('settings.change_photo')}</Button>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('settings.full_name')}</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('common.phone')}</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">{t('common.tax_id')}</Label>
                  <Input
                    id="taxId"
                    value={profileData.taxId}
                    onChange={(e) =>
                      setProfileData({ ...profileData, taxId: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="address">{t('common.address')}</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-trust-blue" onClick={handleProfileSave}>
                  {t('settings.save_changes')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          {/* ... existing integrations content ... */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Manager & Integrations</CardTitle>
              <CardDescription>
                Manage booking channels and external service connections.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Channel Managers */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" /> Booking Channels
                </h3>
                <div className="grid gap-4">
                  {/* ... channels mock */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-4">
                      <div className="bg-rose-50 p-2 rounded">
                        <img
                          src="https://img.usecurling.com/i?q=airbnb&color=red"
                          className="w-8 h-8"
                          alt="Airbnb"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">Airbnb</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {channelStatus.airbnb.connected ? (
                            <>
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 gap-1"
                              >
                                <CheckCircle className="w-3 h-3" /> Connected
                              </Badge>
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Last Sync:{' '}
                                {channelStatus.airbnb.lastSync}
                              </span>
                            </>
                          ) : (
                            <Badge variant="secondary">Disconnected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!channelStatus.airbnb.connected}
                      >
                        Configure
                      </Button>
                      <Switch
                        checked={channelStatus.airbnb.connected}
                        onCheckedChange={() => toggleChannel('airbnb')}
                      />
                    </div>
                  </div>
                  {/* Other channels similar to above */}
                </div>
              </div>

              <Separator />

              {/* Bill.com Integration */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> BILL Platform (Payables)
                  </h3>
                  <Switch
                    checked={financialData.billComEnabled || false}
                    onCheckedChange={(checked) =>
                      handleFinancialChange('billComEnabled', checked)
                    }
                  />
                </div>
                {financialData.billComEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-md animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>Organization ID</Label>
                      <Input
                        value={financialData.billComOrgId || ''}
                        onChange={(e) =>
                          handleFinancialChange('billComOrgId', e.target.value)
                        }
                        placeholder="org_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Developer API Key</Label>
                      <Input
                        type="password"
                        value={financialData.billComApiKey || ''}
                        onChange={(e) =>
                          handleFinancialChange('billComApiKey', e.target.value)
                        }
                        placeholder="key_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Environment</Label>
                      <Select
                        value={financialData.billComEnvironment || 'sandbox'}
                        onValueChange={(v: any) =>
                          handleFinancialChange('billComEnvironment', v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">
                            Sandbox (Test)
                          </SelectItem>
                          <SelectItem value="production">
                            Production (Live)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleFinancialSave} className="bg-trust-blue">
                  {t('settings.save_changes')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          {/* ... existing billing content ... */}
          <Card>
            <CardHeader>
              <CardTitle>Billing & Payment</CardTitle>
              <CardDescription>
                Configure automated payouts and banking info.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alert Configuration */}
              <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm mb-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  <h4 className="font-semibold">Email Alerts Configuration</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <Label htmlFor="priceReviewThreshold">
                      {t('settings.price_review_threshold')}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('settings.price_review_desc')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="priceReviewThreshold"
                      type="number"
                      value={financialData.priceReviewThresholdDays || 180}
                      onChange={(e) =>
                        handleFinancialChange(
                          'priceReviewThresholdDays',
                          Number(e.target.value),
                        )
                      }
                      className="max-w-[100px]"
                    />
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    value={financialData.bankName}
                    onChange={(e) =>
                      handleFinancialChange('bankName', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Routing Number</Label>
                  <Input
                    value={financialData.routingNumber}
                    onChange={(e) =>
                      handleFinancialChange('routingNumber', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    value={financialData.accountNumber}
                    onChange={(e) =>
                      handleFinancialChange('accountNumber', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select defaultValue="checking">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>PM Management Fee (%)</Label>
                  <Input
                    type="number"
                    value={financialData.pmManagementFee || 0}
                    onChange={(e) =>
                      handleFinancialChange(
                        'pmManagementFee',
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cleaning Fee Routing</Label>
                  <Select
                    value={financialData.cleaningFeeRouting || 'pm'}
                    onValueChange={(v) =>
                      handleFinancialChange('cleaningFeeRouting', v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pm">Property Manager</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleFinancialSave} className="bg-trust-blue">
                  Save Billing Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.alert_prefs')}</CardTitle>
              <CardDescription>{t('settings.alert_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="p-2 bg-blue-50 rounded-full">
                        <Bell className="h-5 w-5 text-trust-blue" />
                      </div>
                      <div>
                        <Label
                          htmlFor={`switch-${alert.id}`}
                          className="font-semibold text-base block mb-1"
                        >
                          {alert.label ||
                            t(
                              `settings.trigger_${alert.trigger.split('_')[1]}`,
                            )}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails for {alert.trigger.replace(/_/g, ' ')}.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select
                        value={alert.frequency}
                        onValueChange={(val) =>
                          handleAlertChange(alert.id, 'frequency', val)
                        }
                        disabled={!alert.enabled}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder={t('settings.frequency')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">
                            {t('settings.freq_immediate')}
                          </SelectItem>
                          <SelectItem value="daily">
                            {t('settings.freq_daily')}
                          </SelectItem>
                          <SelectItem value="weekly">
                            {t('settings.freq_weekly')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Switch
                        id={`switch-${alert.id}`}
                        checked={alert.enabled}
                        onCheckedChange={(checked) =>
                          handleAlertChange(alert.id, 'enabled', checked)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleFinancialSave} className="bg-trust-blue">
                  {t('settings.save_changes')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canViewAudit && (
          <TabsContent value="audit">
            <AuditLogList />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
