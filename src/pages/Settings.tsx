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
import useLanguageStore from '@/stores/useLanguageStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { AuditLogList } from '@/components/audit/AuditLogList'
import { User, FinancialSettings } from '@/lib/types'
import useUserStore from '@/stores/useUserStore'
import {
  Globe,
  CreditCard,
  Bell,
  Wallet,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DataMask } from '@/components/DataMask'

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
      description: t('settings.update_info'),
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
        <h1 className="text-3xl font-bold tracking-tight text-black">
          {t('settings.title')}
        </h1>
        <p className="text-black font-medium">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto bg-slate-100 border border-slate-200">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-white data-[state=active]:text-black font-medium text-slate-600"
          >
            {t('common.profile')}
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-white data-[state=active]:text-black font-medium text-slate-600"
          >
            {t('settings.integrations')}
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-[state=active]:bg-white data-[state=active]:text-black font-medium text-slate-600"
          >
            {t('settings.billing_payment')}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-white data-[state=active]:text-black font-medium text-slate-600"
          >
            {t('common.notifications')}
          </TabsTrigger>
          {canViewAudit && (
            <TabsTrigger
              value="audit"
              className="data-[state=active]:bg-white data-[state=active]:text-black font-medium text-slate-600"
            >
              {t('common.system_activity')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-black">
                {t('settings.personal_info')}
              </CardTitle>
              <CardDescription className="text-black font-medium">
                {t('settings.update_info')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="text-black font-bold bg-slate-200">
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="border-slate-300 text-black font-medium"
                >
                  {t('settings.change_photo')}
                </Button>
              </div>
              <Separator className="bg-slate-200" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-black font-bold">
                    {t('settings.full_name')}
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-bold">
                    {t('common.email')}
                  </Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-black font-bold">
                    {t('common.phone')}
                  </Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId" className="text-black font-bold">
                    {t('common.tax_id')}
                  </Label>
                  <Input
                    id="taxId"
                    value={profileData.taxId}
                    onChange={(e) =>
                      setProfileData({ ...profileData, taxId: e.target.value })
                    }
                    className="text-black"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-black font-bold">
                    {t('common.address')}
                  </Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                    className="text-black"
                  />
                </div>
              </div>

              <Separator className="bg-slate-200" />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2 text-black">
                  <Bell className="h-4 w-4" /> {t('common.notifications')}
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
                    <Label htmlFor="notif-financial" className="text-black">
                      Financial Alerts
                    </Label>
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
                    <Label htmlFor="notif-maint" className="text-black">
                      Maintenance
                    </Label>
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
                    <Label htmlFor="notif-contract" className="text-black">
                      Contract Updates
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-trust-blue text-white font-bold"
                  onClick={handleProfileSave}
                >
                  {t('settings.save_changes')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-black">
                {t('settings.integrations')}
              </CardTitle>
              <CardDescription className="text-black font-medium">
                {t('marketing_tab.portal_sync')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Channel Managers */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-black">
                  <Globe className="h-5 w-5" /> Booking Channels
                </h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                    <div className="flex items-center gap-4">
                      <div className="bg-rose-50 p-2 rounded">
                        <img
                          src="https://img.usecurling.com/i?q=airbnb&color=red"
                          className="w-8 h-8"
                          alt="Airbnb"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-black">Airbnb</p>
                        <div className="flex items-center gap-2 text-xs text-black font-medium">
                          {channelStatus.airbnb.connected ? (
                            <>
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 gap-1 font-bold"
                              >
                                <CheckCircle className="w-3 h-3" /> Connected
                              </Badge>
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Last Sync:{' '}
                                {channelStatus.airbnb.lastSync}
                              </span>
                            </>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="font-bold text-black"
                            >
                              Disconnected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-300 text-black font-bold"
                        disabled={!channelStatus.airbnb.connected}
                      >
                        Config
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
                <Button
                  onClick={handleFinancialSave}
                  className="bg-trust-blue text-white font-bold"
                >
                  {t('settings.save_changes')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-black">
                {t('settings.billing_gateways_title')}
              </CardTitle>
              <CardDescription className="text-black font-medium">
                {t('settings.billing_gateways_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2 text-black">
                  <Wallet className="h-5 w-5" />{' '}
                  {t('settings.payment_gateways')}
                </h3>

                {/* Stripe */}
                <div className="border border-slate-200 rounded-md p-4 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                      <Label className="text-base font-bold text-black">
                        Stripe
                      </Label>
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
                        <Label className="text-black font-bold">
                          Public Key
                        </Label>
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
                          className="text-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-black font-bold">
                          Secret Key
                        </Label>
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
                          className="text-black"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-200" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-black font-bold">
                    {t('partners.bank_name')}
                  </Label>
                  <Input
                    value={financialData.bankName}
                    onChange={(e) =>
                      handleFinancialChange('bankName', e.target.value)
                    }
                    className="text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-bold">
                    {t('partners.routing')}
                  </Label>
                  <Input
                    value={financialData.routingNumber}
                    onChange={(e) =>
                      handleFinancialChange('routingNumber', e.target.value)
                    }
                    className="text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black font-bold">
                    {t('partners.account')}
                  </Label>
                  <Input
                    value={financialData.accountNumber}
                    onChange={(e) =>
                      handleFinancialChange('accountNumber', e.target.value)
                    }
                    className="text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleFinancialSave}
                  className="bg-trust-blue text-white font-bold"
                >
                  {t('settings.save_changes')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-black">
                {t('settings.system_alerts')}
              </CardTitle>
              <CardDescription className="text-black font-medium">
                {t('settings.system_alerts_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-black mb-4 font-medium">
                {t('settings.system_alerts_help')}
              </p>
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
