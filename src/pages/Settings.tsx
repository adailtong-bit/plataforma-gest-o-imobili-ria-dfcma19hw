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

export default function Settings() {
  const { t } = useLanguageStore()
  const { automationRules, updateAutomationRule } = useAutomationStore()

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
          <TabsTrigger value="team">{t('common.team')}</TabsTrigger>
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
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <Button variant="outline">{t('settings.change_photo')}</Button>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('settings.full_name')}</Label>
                  <Input id="name" defaultValue="Admin User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('common.email')}</Label>
                  <Input id="email" defaultValue="admin@sistema.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('common.phone')}</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t('common.role')}</Label>
                  <Input id="role" defaultValue="Gerente Geral" disabled />
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
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('settings.sms_notif')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.sms_desc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    {t('settings.tasks_notif')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.tasks_desc')}
                  </p>
                </div>
                <Switch />
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
              <div className="flex justify-end">
                <Button className="bg-trust-blue">
                  {t('settings.save_changes')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
