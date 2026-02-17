import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Zap, FileCheck, Bell, Download, Database, Lock } from 'lucide-react'
import useAutomationStore from '@/stores/useAutomationStore'
import { useToast } from '@/hooks/use-toast'
import { AutomationRule } from '@/lib/types'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Automation() {
  const { automationRules, updateAutomationRule } = useAutomationStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const { currentUser } = useAuthStore()
  const [isExporting, setIsExporting] = useState(false)
  const [exportScopeOpen, setExportScopeOpen] = useState(false)
  const [exportScope, setExportScope] = useState('general')

  const isPM = ['platform_owner', 'software_tenant'].includes(currentUser.role)

  const handleToggle = (id: string, enabled: boolean) => {
    const rule = automationRules.find((r) => r.id === id)
    if (rule) {
      updateAutomationRule({ ...rule, enabled })
      toast({
        title: 'Automation Updated',
        description: `Rule ${enabled ? 'enabled' : 'disabled'} successfully.`,
      })
    }
  }

  const handleUpdateConfig = (id: string, updates: Partial<AutomationRule>) => {
    const rule = automationRules.find((r) => r.id === id)
    if (rule) {
      updateAutomationRule({ ...rule, ...updates })
      toast({ title: 'Configuration Saved' })
    }
  }

  const initiateExport = () => {
    if (!isPM) {
      toast({
        title: 'Access Denied',
        description: 'Only Property Managers can export to QuickBooks.',
        variant: 'destructive',
      })
      return
    }
    setExportScopeOpen(true)
  }

  const handleQuickBooksExport = () => {
    setExportScopeOpen(false)
    setIsExporting(true)
    toast({
      title: t('automation.export_success_title'),
      description: `Exporting data scope: ${exportScope}`,
    })

    // Mock export generation
    setTimeout(() => {
      const headers = [
        'Date',
        'Transaction Type',
        'No.',
        'Name',
        'Memo/Description',
        'Account',
        'Class',
        'Amount',
      ]
      const row1 = [
        '2024-01-15',
        'Invoice',
        '1001',
        'Tenant John',
        'Rent January',
        'Accounts Receivable',
        'Rental Income',
        '2000.00',
      ]
      const row2 = [
        '2024-01-16',
        'Bill',
        '2001',
        'Partner Plumber',
        'Fix Leak',
        'Maintenance Expense',
        'Repairs',
        '-150.00',
      ]

      const csvContent = [
        headers.join(','),
        row1.join(','),
        row2.join(','),
      ].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `quickbooks_export_${exportScope}_${new Date().toISOString().split('T')[0]}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setIsExporting(false)
    }, 2000)
  }

  const autoApproveRule = automationRules.find(
    (r) => r.type === 'auto_approve_task',
  )
  const autoInvoiceRule = automationRules.find(
    (r) => r.type === 'auto_generate_invoice',
  )
  const rentReminderRule = automationRules.find(
    (r) => r.type === 'rent_reminder',
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('settings.automation_title')}
        </h1>
        <p className="text-muted-foreground">{t('settings.automation_desc')}</p>
      </div>

      <div className="grid gap-6">
        {/* QuickBooks Integration - Restricted to PM */}
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-full">
                <Database className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {t('automation.quickbooks_export')}
                  {!isPM && <Lock className="h-4 w-4 text-muted-foreground" />}
                </CardTitle>
                <CardDescription>
                  {t('automation.quickbooks_desc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={initiateExport}
                disabled={isExporting || !isPM}
                className="bg-green-700 hover:bg-green-800"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : t('automation.export_csv')}
              </Button>
            </div>
            {!isPM && (
              <p className="text-xs text-red-500 mt-2">
                Restricted to Property Managers only.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Task Automation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>{t('automation.auto_approval')}</CardTitle>
                <CardDescription>
                  {t('automation.auto_approval_desc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-approve">
                {t('automation.enable_auto_approval')}
              </Label>
              <Switch
                id="auto-approve"
                checked={autoApproveRule?.enabled || false}
                onCheckedChange={(c) =>
                  handleToggle(autoApproveRule?.id || '', c)
                }
              />
            </div>
            {autoApproveRule?.enabled && (
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Label>Max Cost Threshold ($)</Label>
                <Input
                  type="number"
                  className="w-32"
                  value={autoApproveRule.threshold || 0}
                  onChange={(e) =>
                    handleUpdateConfig(autoApproveRule.id, {
                      threshold: Number(e.target.value),
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  Tasks below this amount will be approved instantly.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Automation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle>{t('automation.billing_automation')}</CardTitle>
                <CardDescription>
                  {t('automation.billing_automation_desc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-invoice">
                {t('automation.auto_generate_invoices')}
              </Label>
              <Switch
                id="auto-invoice"
                checked={autoInvoiceRule?.enabled || false}
                onCheckedChange={(c) =>
                  handleToggle(autoInvoiceRule?.id || '', c)
                }
              />
            </div>
            {autoInvoiceRule?.enabled && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-2">Trigger Event:</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="bg-white border-blue-500 text-blue-700"
                  >
                    Task Completion
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Invoices will be drafted when a task status changes to
                  "Completed".
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Communication Automation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>{t('settings.rent_reminder')}</CardTitle>
                <CardDescription>
                  {t('automation.rent_reminders_desc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="rent-reminder">
                {t('automation.enable_reminders')}
              </Label>
              <Switch
                id="rent-reminder"
                checked={rentReminderRule?.enabled || false}
                onCheckedChange={(c) =>
                  handleToggle(rentReminderRule?.id || '', c)
                }
              />
            </div>
            {rentReminderRule?.enabled && (
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Label>{t('settings.days_before')}</Label>
                <Input
                  type="number"
                  className="w-20"
                  value={rentReminderRule.daysBefore || 3}
                  onChange={(e) =>
                    handleUpdateConfig(rentReminderRule.id, {
                      daysBefore: Number(e.target.value),
                    })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  Automatic email/SMS will be sent.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={exportScopeOpen} onOpenChange={setExportScopeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Export Scope</DialogTitle>
            <DialogDescription>
              Choose the data range for the QuickBooks export.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Data Scope</Label>
            <Select value={exportScope} onValueChange={setExportScope}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Activities</SelectItem>
                <SelectItem value="owner">By Owner</SelectItem>
                <SelectItem value="partner">By Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportScopeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickBooksExport}>Confirm Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
