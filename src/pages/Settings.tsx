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

export default function Settings() {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const { automationRules, updateAutomationRule } = useAutomationStore()
  const { financialSettings, updateFinancialSettings } = useFinancialStore()
  const { currentUser } = useAuthStore()
  const [formData, setFormData] = useState(financialSettings)

  const handleFinancialSave = () => {
    // Basic validation
    if (
      formData.routingNumber.length !== 9 ||
      !/^\d+$/.test(formData.routingNumber)
    ) {
      toast({
        title: t('common.error'),
        description: 'Routing Number must be 9 digits.',
        variant: 'destructive',
      })
      return
    }

    updateFinancialSettings(formData)
    toast({
      title: t('common.save'),
      description: 'Configurações financeiras atualizadas.',
    })
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const canViewAudit = hasPermission(currentUser as User, 'audit_logs', 'view')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">{t('common.profile')}</TabsTrigger>
          <TabsTrigger value="notifications">
            {t('common.notifications')}
          </TabsTrigger>
          <TabsTrigger value="automation">{t('common.automation')}</TabsTrigger>
          <TabsTrigger value="gateway">
            {t('settings.payment_gateway')}
          </TabsTrigger>
          {canViewAudit && <TabsTrigger value="audit">Auditoria</TabsTrigger>}
        </TabsList>

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
                    value={formData.companyName}
                    onChange={(e) =>
                      handleChange('companyName', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.ein')}</Label>
                  <Input
                    value={formData.ein}
                    onChange={(e) => handleChange('ein', e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.bank_name')}</Label>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.routing_number')}</Label>
                  <Input
                    value={formData.routingNumber}
                    onChange={(e) =>
                      handleChange('routingNumber', e.target.value)
                    }
                    placeholder="9 digits"
                    maxLength={9}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('settings.account_number')}</Label>
                  <Input
                    value={formData.accountNumber}
                    onChange={(e) =>
                      handleChange('accountNumber', e.target.value)
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
                      value={formData.apiKey || ''}
                      onChange={(e) => handleChange('apiKey', e.target.value)}
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Secret</Label>
                    <Input
                      value={formData.apiSecret || ''}
                      onChange={(e) =>
                        handleChange('apiSecret', e.target.value)
                      }
                      type="password"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isProduction}
                    onCheckedChange={(c) => handleChange('isProduction', c)}
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
                  <Input id="name" defaultValue={currentUser.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <Input id="email" defaultValue={currentUser.email} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-trust-blue">
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
