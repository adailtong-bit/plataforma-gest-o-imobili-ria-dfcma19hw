import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, Mail, PlayCircle } from 'lucide-react'
import useManagementStore from '@/stores/useManagementStore'
import { useToast } from '@/hooks/use-toast'
import { MarketingWorkflow, EmailTemplate } from '@/lib/types'

export function MarketingAutomation() {
  const {
    marketingWorkflows,
    emailTemplates,
    addMarketingWorkflow,
    updateMarketingWorkflow,
    deleteMarketingWorkflow,
    addEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
  } = useManagementStore()
  const { toast } = useToast()

  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<
    Partial<MarketingWorkflow>
  >({
    name: '',
    trigger: 'booking_confirmed',
    offsetTime: 0,
    active: true,
  })
  const [editingTemplate, setEditingTemplate] = useState<
    Partial<EmailTemplate>
  >({
    name: '',
    subject: '',
    body: '',
  })

  const handleSaveWorkflow = () => {
    if (!editingWorkflow.name || !editingWorkflow.templateId) {
      toast({
        title: 'Error',
        description: 'Name and Template are required.',
        variant: 'destructive',
      })
      return
    }

    if (editingWorkflow.id) {
      updateMarketingWorkflow(editingWorkflow as MarketingWorkflow)
    } else {
      addMarketingWorkflow({
        ...editingWorkflow,
        id: `mw-${Date.now()}`,
      } as MarketingWorkflow)
    }
    setWorkflowDialogOpen(false)
    setEditingWorkflow({
      name: '',
      trigger: 'booking_confirmed',
      offsetTime: 0,
      active: true,
    })
    toast({ title: 'Success', description: 'Workflow saved.' })
  }

  const handleSaveTemplate = () => {
    if (
      !editingTemplate.name ||
      !editingTemplate.subject ||
      !editingTemplate.body
    ) {
      toast({
        title: 'Error',
        description: 'All fields are required.',
        variant: 'destructive',
      })
      return
    }

    if (editingTemplate.id) {
      updateEmailTemplate(editingTemplate as EmailTemplate)
    } else {
      addEmailTemplate({
        ...editingTemplate,
        id: `et-${Date.now()}`,
      } as EmailTemplate)
    }
    setTemplateDialogOpen(false)
    setEditingTemplate({ name: '', subject: '', body: '' })
    toast({ title: 'Success', description: 'Template saved.' })
  }

  return (
    <div className="grid gap-6">
      {/* Workflow Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Automated Workflows</CardTitle>
            <CardDescription>
              Trigger emails based on booking events.
            </CardDescription>
          </div>
          <Button onClick={() => setWorkflowDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Workflow
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Timing</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketingWorkflows.map((wf) => (
                <TableRow key={wf.id}>
                  <TableCell className="font-medium">{wf.name}</TableCell>
                  <TableCell className="capitalize">
                    {wf.trigger.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    {wf.offsetTime === 0
                      ? 'Immediately'
                      : `${Math.abs(wf.offsetTime)} hours ${wf.offsetTime > 0 ? 'after' : 'before'}`}
                  </TableCell>
                  <TableCell>
                    {emailTemplates.find((t) => t.id === wf.templateId)?.name ||
                      'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={wf.active ? 'default' : 'secondary'}>
                      {wf.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingWorkflow(wf)
                          setWorkflowDialogOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => deleteMarketingWorkflow(wf.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>
              Reusable content with placeholders like {'{guest_name}'}.
            </CardDescription>
          </div>
          <Button
            onClick={() => setTemplateDialogOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Mail className="h-4 w-4" /> New Template
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTemplates.map((tpl) => (
              <Card key={tpl.id} className="bg-slate-50">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold">
                      {tpl.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setEditingTemplate(tpl)
                          setTemplateDialogOpen(true)
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => deleteEmailTemplate(tpl.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs truncate">
                    {tpl.subject}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 text-xs text-muted-foreground line-clamp-3">
                  {tpl.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Dialog */}
      <Dialog open={workflowDialogOpen} onOpenChange={setWorkflowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWorkflow.id ? 'Edit Workflow' : 'New Workflow'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={editingWorkflow.name}
                onChange={(e) =>
                  setEditingWorkflow({
                    ...editingWorkflow,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Trigger Event</Label>
              <Select
                value={editingWorkflow.trigger}
                onValueChange={(v: any) =>
                  setEditingWorkflow({ ...editingWorkflow, trigger: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking_confirmed">
                    Booking Confirmed
                  </SelectItem>
                  <SelectItem value="check_in">Check In</SelectItem>
                  <SelectItem value="check_out">Check Out</SelectItem>
                  <SelectItem value="cancellation">Cancellation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Timing (Hours offset)</Label>
              <Input
                type="number"
                value={editingWorkflow.offsetTime}
                onChange={(e) =>
                  setEditingWorkflow({
                    ...editingWorkflow,
                    offsetTime: Number(e.target.value),
                  })
                }
                placeholder="e.g. -24 for 1 day before"
              />
              <p className="text-xs text-muted-foreground">
                Negative for "before event", positive for "after event", 0 for
                "immediate".
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Email Template</Label>
              <Select
                value={editingWorkflow.templateId}
                onValueChange={(v) =>
                  setEditingWorkflow({ ...editingWorkflow, templateId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingWorkflow.active}
                onCheckedChange={(c) =>
                  setEditingWorkflow({ ...editingWorkflow, active: c })
                }
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveWorkflow}>Save Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate.id ? 'Edit Template' : 'New Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Template Name</Label>
              <Input
                value={editingTemplate.name}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Email Subject</Label>
              <Input
                value={editingTemplate.subject}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    subject: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Email Body</Label>
              <Textarea
                value={editingTemplate.body}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    body: e.target.value,
                  })
                }
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Available placeholders: {'{guest_name}'}, {'{property_name}'},{' '}
                {'{check_in}'}, {'{check_out}'}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
