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
import {
  Zap,
  FileCheck,
  FileText,
  Bell,
  Download,
  Database,
} from 'lucide-react'
import useAutomationStore from '@/stores/useAutomationStore'
import { useToast } from '@/hooks/use-toast'
import { AutomationRule } from '@/lib/types'
import useLanguageStore from '@/stores/useLanguageStore'

export default function Automation() {
  const { automationRules, updateAutomationRule } = useAutomationStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [isExporting, setIsExporting] = useState(false)

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

  const handleQuickBooksExport = (format: 'csv' | 'excel') => {
    setIsExporting(true)
    toast({
      title: t('automation.export_success_title'),
      description: t('automation.export_success_desc'),
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
        `quickbooks_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`,
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
        {/* QuickBooks Integration - New Feature */}
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-full">
                <Database className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <CardTitle>{t('automation.quickbooks_export')}</CardTitle>
                <CardDescription>
                  {t('automation.quickbooks_desc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => handleQuickBooksExport('csv')}
                disabled={isExporting}
                className="bg-green-700 hover:bg-green-800"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : t('automation.export_csv')}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickBooksExport('excel')}
                disabled={isExporting}
                className="border-green-200 text-green-800 hover:bg-green-100"
              >
                <FileText className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : t('automation.export_excel')}
              </Button>
            </div>
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
                <CardTitle>Task Auto-Approval</CardTitle>
                <CardDescription>
                  Automatically approve maintenance tasks below a certain cost.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-approve">Enable Auto-Approval</Label>
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
                <CardTitle>Billing Automation</CardTitle>
                <CardDescription>
                  Generate invoices automatically based on events.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-invoice">Auto-Generate Invoices</Label>
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
                  Send automated reminders to tenants.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="rent-reminder">Enable Reminders</Label>
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
    </div>
  )
}
