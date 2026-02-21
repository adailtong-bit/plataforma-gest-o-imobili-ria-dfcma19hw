import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FinancialSettings as FinancialSettingsComponent } from '@/components/settings/FinancialSettings'
import {
  Settings as SettingsIcon,
  CreditCard,
  Users,
  Link as LinkIcon,
  Database,
  ClipboardList,
} from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AuditLogList } from '@/components/audit/AuditLogList'

export default function Settings() {
  const { t } = useLanguageStore()
  const { currentUser } = useAuthStore()

  if (!hasPermission(currentUser as User, 'settings', 'view')) {
    return (
      <div className="p-8 text-center">{t('common.access_denied_desc')}</div>
    )
  }

  const isPM = ['platform_owner', 'software_tenant'].includes(currentUser.role)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto bg-slate-100 border border-slate-200 gap-1 p-1">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" /> {t('settings.general')}
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <CreditCard className="h-4 w-4" /> {t('settings.financial')}
          </TabsTrigger>
          {isPM && (
            <TabsTrigger value="integrations" className="gap-2">
              <LinkIcon className="h-4 w-4" /> {t('settings.integrations')}
            </TabsTrigger>
          )}
          {isPM && (
            <TabsTrigger value="roles" className="gap-2">
              <Users className="h-4 w-4" /> {t('settings.roles_permissions')}
            </TabsTrigger>
          )}
          <TabsTrigger value="audit" className="gap-2">
            <ClipboardList className="h-4 w-4" /> Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.general')}</CardTitle>
              <CardDescription>{t('settings.general_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('settings.enable_notifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.receive_email_alerts')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>{t('settings.default_language')}</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <FinancialSettingsComponent />
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" /> QuickBooks
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    Connected
                  </Badge>
                </div>
                <CardDescription>Accounting synchronization.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage Sync
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" /> OwnerRez
                  </CardTitle>
                  <Badge variant="outline">Disconnected</Badge>
                </div>
                <CardDescription>Channel Manager integration.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Connect
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" /> Stripe
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    Connected
                  </Badge>
                </div>
                <CardDescription>Payment Gateway.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage Gateway
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Configurations</CardTitle>
              <CardDescription>
                Manage what each role can access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Role editing is restricted to Super Admins in this demo
                environment.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                History of recent system changes and user interactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
