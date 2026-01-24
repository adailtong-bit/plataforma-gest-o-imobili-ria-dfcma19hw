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
import { Separator } from '@/components/ui/separator'
import { Zap, FileCheck, FileText, Bell, Download } from 'lucide-react'
import useAutomationStore from '@/stores/useAutomationStore'
import { useToast } from '@/hooks/use-toast'
import { AutomationRule } from '@/lib/types'
import useLanguageStore from '@/stores/useLanguageStore'

export default function Automation() {
  const { automationRules, updateAutomationRule } = useAutomationStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

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
    toast({
      title: 'Export Started',
      description: `Generating QuickBooks ${format.toUpperCase()} export...`,
    })
    // Mock export logic
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = '#'
      link.setAttribute(
        'download',
        `quickbooks_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: 'Export Complete',
        description: 'File downloaded successfully.',
      })
    }, 1500)
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
          {t('automation_title') || 'Workflow Automation Engine'}
        </h1>
        <p className="text-muted-foreground">
          {t('automation_desc') ||
            'Define rules to automate repetitive tasks and financial processes.'}
        </p>
      </div>

      <div className="grid gap-6">
        {/* QuickBooks Export */}
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-full">
                <Download className="h-5 w-5 text-green-700" />
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
            <div className="flex gap-4">
              <Button onClick={() => handleQuickBooksExport('csv')}>
                {t('automation.export_csv')}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickBooksExport('excel')}
              >
                {t('automation.export_excel')}
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
              <div className="p-2 bg-green-100 rounded-full">
                <FileText className="h-5 w-5 text-green-600" />
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
                  <Button variant="outline" disabled>
                    Booking Confirmation (Coming Soon)
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
                <CardTitle>Smart Notifications</CardTitle>
                <CardDescription>
                  Send automated reminders to tenants and owners.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="rent-reminder">Rent Reminders</Label>
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
                <Label>Days Before Due</Label>
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
