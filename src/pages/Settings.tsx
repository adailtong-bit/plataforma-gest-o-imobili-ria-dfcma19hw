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
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

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

  const [notificationPrefs, setNotificationPrefs] = useState({
    financials:
      (currentUser as User).notificationPreferences?.financials ?? true,
    maintenance:
      (currentUser as User).notificationPreferences?.maintenance ?? true,
    contractUpdates:
      (currentUser as User).notificationPreferences?.contractUpdates ?? true,
  })

  // Mock Channel States
  const [channelStatus, setChannelStatus] = useState({
    airbnb: { connected: true, lastSync: '2 minutes ago', status: 'Healthy' },
    booking: { connected: true, lastSync: '15 minutes ago', status: 'Healthy' },
    vrbo: { connected: false, lastSync: 'Never', status: 'Disconnected' },
  })

  const handleFinancialSave = () => {
    updateFinancialSettings(financialData)
    toast({
      title: t('common.save'),
      description: 'Financial settings updated.',
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
      notificationPreferences: notificationPrefs,
    })
    toast({
      title: t('common.save'),
      description: 'Profile updated successfully.',
    })
  }

  const handleFinancialChange = (field: string, value: any) => {
    setFinancialData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGatewayChange = (
    gateway: 'stripe' | 'paypal' | 'mercadoPago',
    field: string,
    value: any,
  ) => {
    setFinancialData((prev) => ({
      ...prev,
      gateways: {
        ...prev.gateways,
        [gateway]: {
          ...prev.gateways[gateway],
          [field]: value,
        },
      },
    }))
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

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Notification Preferences
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notif-financial"
                      checked={notificationPrefs.financials}
                      onCheckedChange={(c) =>
                        setNotificationPrefs((p) => ({
                          ...p,
                          financials: c as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="notif-financial">Financial Alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notif-maint"
                      checked={notificationPrefs.maintenance}
                      onCheckedChange={(c) =>
                        setNotificationPrefs((p) => ({
                          ...p,
                          maintenance: c as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="notif-maint">Maintenance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notif-contract"
                      checked={notificationPrefs.contractUpdates}
                      onCheckedChange={(c) =>
                        setNotificationPrefs((p) => ({
                          ...p,
                          contractUpdates: c as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="notif-contract">Contract Updates</Label>
                  </div>
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
                </div>
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
          <Card>
            <CardHeader>
              <CardTitle>Billing & Payment Gateways</CardTitle>
              <CardDescription>
                Configure payment methods and payout settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Gateways Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Wallet className="h-5 w-5" /> Payment Gateways
                </h3>

                {/* Stripe */}
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                      <Label className="text-base font-semibold">Stripe</Label>
                    </div>
                    <Switch
                      checked={financialData.gateways?.stripe?.enabled}
                      onCheckedChange={(c) =>
                        handleGatewayChange('stripe', 'enabled', c)
                      }
                    />
                  </div>
                  {financialData.gateways?.stripe?.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label>Public Key</Label>
                        <Input
                          placeholder="pk_test_..."
                          value={financialData.gateways.stripe.publicKey || ''}
                          onChange={(e) =>
                            handleGatewayChange(
                              'stripe',
                              'publicKey',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Secret Key</Label>
                        <Input
                          type="password"
                          placeholder="sk_test_..."
                          value={financialData.gateways.stripe.secretKey || ''}
                          onChange={(e) =>
                            handleGatewayChange(
                              'stripe',
                              'secretKey',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal */}
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                      <Label className="text-base font-semibold">PayPal</Label>
                    </div>
                    <Switch
                      checked={financialData.gateways?.paypal?.enabled}
                      onCheckedChange={(c) =>
                        handleGatewayChange('paypal', 'enabled', c)
                      }
                    />
                  </div>
                  {financialData.gateways?.paypal?.enabled && (
                    <div className="mt-2">
                      <div className="space-y-2">
                        <Label>Client ID</Label>
                        <Input
                          placeholder="Client ID"
                          value={financialData.gateways.paypal.clientId || ''}
                          onChange={(e) =>
                            handleGatewayChange(
                              'paypal',
                              'clientId',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mercado Pago */}
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-cyan-600" />
                      <Label className="text-base font-semibold">
                        Mercado Pago
                      </Label>
                    </div>
                    <Switch
                      checked={financialData.gateways?.mercadoPago?.enabled}
                      onCheckedChange={(c) =>
                        handleGatewayChange('mercadoPago', 'enabled', c)
                      }
                    />
                  </div>
                  {financialData.gateways?.mercadoPago?.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label>Public Key</Label>
                        <Input
                          placeholder="TEST-..."
                          value={
                            financialData.gateways.mercadoPago.publicKey || ''
                          }
                          onChange={(e) =>
                            handleGatewayChange(
                              'mercadoPago',
                              'publicKey',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Access Token</Label>
                        <Input
                          type="password"
                          placeholder="TEST-..."
                          value={
                            financialData.gateways.mercadoPago.accessToken || ''
                          }
                          onChange={(e) =>
                            handleGatewayChange(
                              'mercadoPago',
                              'accessToken',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
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
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Global notification settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These settings control the generation of system alerts. For your
                personal notification preferences, please go to the Profile tab.
              </p>
              {/* Existing alert config logic */}
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
