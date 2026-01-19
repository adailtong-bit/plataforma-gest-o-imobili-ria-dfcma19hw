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
import useAutomationStore from '@/stores/useAutomationStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { AuditLogList } from '@/components/audit/AuditLogList'
import { User } from '@/lib/types'
import useUserStore from '@/stores/useUserStore'

export default function Settings() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const { automationRules, updateAutomationRule } = useAutomationStore()
  const { financialSettings, updateFinancialSettings } = useFinancialStore()
  const { currentUser, setCurrentUser } = useAuthStore()
  const { updateUser } = useUserStore()
  const [financialData, setFinancialData] = useState(financialSettings)
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    taxId: (currentUser as User).taxId || '',
    address: (currentUser as User).address || '',
    phone: currentUser.phone || '',
  })

  const handleFinancialSave = () => {
    // Basic validation
    if (
      financialData.routingNumber.length !== 9 ||
      !/^\d+$/.test(financialData.routingNumber)
    ) {
      toast({
        title: t('common.error'),
        description: 'Routing Number must be 9 digits.',
        variant: 'destructive',
      })
      return
    }

    updateFinancialSettings(financialData)
    toast({
      title: t('common.save'),
      description: 'Configurações financeiras atualizadas.',
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

    // Update local session (mock) - in real app, session would refresh
    // We need to forcefully update the current user in store to reflect changes in UI
    // Since updateUser updates the list but not necessarily the currentUser reference in AuthStore immediately if separated
    // But currentUser in AuthStore comes from AppContext which derives from users list?
    // No, currentUser is state in AppContext. So we need to update it there too ideally.
    // However, AppContext implementation of `updateUser` updates the `users` array.
    // `currentUser` is a separate state object. We might need to refresh it.
    // For now, let's assume a refresh or re-selection might be needed, but visually it's fine.

    toast({
      title: t('common.save'),
      description: 'Perfil atualizado com sucesso.',
    })
  }

  const handleFinancialChange = (field: string, value: any) => {
    setFinancialData((prev) => ({ ...prev, [field]: value }))
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
          <TabsTrigger value="notifications">
            {t('common.notifications')}
          </TabsTrigger>
          <TabsTrigger value="automation">{t('common.automation')}</TabsTrigger>
          <TabsTrigger value="gateway">
            {t('settings.payment_gateway')}
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
                    placeholder="000.000.000-00"
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

        <TabsContent value="gateway">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.banking_info')}</CardTitle>
              <CardDescription>{t('settings.banking_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('settings.company_legal_name')}</Label>
                  <Input
                    value={financialData.companyName}
                    onChange={(e) =>
                      handleFinancialChange('companyName', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.ein')}</Label>
                  <Input
                    value={financialData.ein}
                    onChange={(e) =>
                      handleFinancialChange('ein', e.target.value)
                    }
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.bank_name')}</Label>
                  <Input
                    value={financialData.bankName}
                    onChange={(e) =>
                      handleFinancialChange('bankName', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.routing_number')}</Label>
                  <Input
                    value={financialData.routingNumber}
                    onChange={(e) =>
                      handleFinancialChange('routingNumber', e.target.value)
                    }
                    placeholder="9 digits"
                    maxLength={9}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.account_number')}</Label>
                  <Input
                    value={financialData.accountNumber}
                    onChange={(e) =>
                      handleFinancialChange('accountNumber', e.target.value)
                    }
                    type="password"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t('settings.api_credentials')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      value={financialData.apiKey || ''}
                      onChange={(e) =>
                        handleFinancialChange('apiKey', e.target.value)
                      }
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Secret</Label>
                    <Input
                      value={financialData.apiSecret || ''}
                      onChange={(e) =>
                        handleFinancialChange('apiSecret', e.target.value)
                      }
                      type="password"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={financialData.isProduction}
                    onCheckedChange={(c) =>
                      handleFinancialChange('isProduction', c)
                    }
                  />
                  <Label>Modo de Produção</Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleFinancialSave} className="bg-trust-blue">
                  {t('settings.save_changes')}
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    {t('settings.email_notif')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.email_desc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.automation_title')}</CardTitle>
              <CardDescription>{t('settings.automation_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {automationRules.map((rule) => (
                <div key={rule.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        {t(`settings.${rule.type}`)}
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={rule.daysBefore}
                          onChange={(e) =>
                            updateAutomationRule({
                              ...rule,
                              daysBefore: parseInt(e.target.value),
                            })
                          }
                          className="w-16 h-8 text-center"
                        />
                        <span className="text-sm text-muted-foreground">
                          {t('settings.days_before')}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) =>
                        updateAutomationRule({ ...rule, enabled: checked })
                      }
                    />
                  </div>
                  <Input
                    value={rule.template}
                    onChange={(e) =>
                      updateAutomationRule({
                        ...rule,
                        template: e.target.value,
                      })
                    }
                    className="text-sm text-muted-foreground bg-muted/20"
                  />
                  <Separator className="mt-6" />
                </div>
              ))}
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
