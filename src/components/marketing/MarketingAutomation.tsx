import { useState, useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

export function MarketingAutomation() {
  const { marketingWorkflows, addMarketingWorkflow } = useContext(AppContext)!
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    trigger: 'booking_confirmed',
    offsetTime: 0,
  })

  const handleSave = () => {
    if (!form.name) return
    addMarketingWorkflow({
      id: `m-wf-${Date.now()}`,
      name: form.name,
      trigger: form.trigger as any,
      offsetTime: Number(form.offsetTime),
      templateId: 't1',
      active: true,
    })
    setOpen(false)
    setForm({ name: '', trigger: 'booking_confirmed', offsetTime: 0 })
    toast({ title: 'Automation workflow created.' })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>{t('automation.title', 'Automated Workflows')}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">{t('automation.add', 'Add Workflow')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('automation.new', 'New Automation')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('automation.name', 'Name')}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('automation.trigger', 'Trigger')}</Label>
                <Select
                  value={form.trigger}
                  onValueChange={(v) => setForm({ ...form, trigger: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking_confirmed">
                      {t(
                        'automation.trigger.booking_confirmed',
                        'Booking Confirmed',
                      )}
                    </SelectItem>
                    <SelectItem value="check_in">
                      {t('automation.trigger.check_in', 'Check-in')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">
                {t('common.save', 'Save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('automation.name', 'Name')}</TableHead>
              <TableHead>{t('automation.trigger', 'Trigger')}</TableHead>
              <TableHead>{t('common.status', 'Status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketingWorkflows.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.name}</TableCell>
                <TableCell className="capitalize">
                  {w.trigger === 'booking_confirmed'
                    ? t(
                        'automation.trigger.booking_confirmed',
                        'Booking Confirmed',
                      )
                    : t('automation.trigger.check_in', 'Check-in')}
                </TableCell>
                <TableCell>
                  {w.active
                    ? t('status.active', 'Active')
                    : t('status.inactive', 'Inactive')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
