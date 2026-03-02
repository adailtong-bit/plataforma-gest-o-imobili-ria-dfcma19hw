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

export function MarketingAutomation() {
  const { marketingWorkflows, addMarketingWorkflow } = useContext(AppContext)!
  const { toast } = useToast()
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
        <CardTitle>Automated Workflows</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Workflow</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Automation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select
                  value={form.trigger}
                  onValueChange={(v) => setForm({ ...form, trigger: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking_confirmed">
                      Booking Confirmed
                    </SelectItem>
                    <SelectItem value="check_in">Check-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketingWorkflows.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.name}</TableCell>
                <TableCell className="capitalize">
                  {w.trigger.replace('_', ' ')}
                </TableCell>
                <TableCell>{w.active ? 'Active' : 'Inactive'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
