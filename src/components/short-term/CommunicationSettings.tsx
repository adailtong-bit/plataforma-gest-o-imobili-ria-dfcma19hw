import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Trash2, Edit } from 'lucide-react'
import useShortTermStore from '@/stores/useShortTermStore'
import { MessageTemplate } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

export function CommunicationSettings() {
  const {
    messageTemplates,
    addMessageTemplate,
    updateMessageTemplate,
    deleteMessageTemplate,
  } = useShortTermStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<
    Partial<MessageTemplate>
  >({
    name: '',
    trigger: 'manual',
    subject: '',
    content: '',
    active: true,
  })

  const handleSave = () => {
    if (!editingTemplate.name || !editingTemplate.content) return

    if (editingTemplate.id) {
      updateMessageTemplate(editingTemplate as MessageTemplate)
      toast({ title: 'Template Updated' })
    } else {
      addMessageTemplate({
        id: `tmpl-${Date.now()}`,
        ...editingTemplate,
      } as MessageTemplate)
      toast({ title: 'Template Created' })
    }
    setIsDialogOpen(false)
    setEditingTemplate({
      name: '',
      trigger: 'manual',
      subject: '',
      content: '',
      active: true,
    })
  }

  const handleEdit = (tmpl: MessageTemplate) => {
    setEditingTemplate(tmpl)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Message Templates</h2>
          <p className="text-muted-foreground">
            Automated messages for guest communication.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTemplate({
              name: '',
              trigger: 'manual',
              subject: '',
              content: '',
              active: true,
            })
            setIsDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> {t('common.add_title')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messageTemplates.map((tmpl) => (
                <TableRow key={tmpl.id}>
                  <TableCell className="font-medium">{tmpl.name}</TableCell>
                  <TableCell className="capitalize">
                    {tmpl.trigger.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={tmpl.active}
                      onCheckedChange={(c) =>
                        updateMessageTemplate({ ...tmpl, active: c })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tmpl)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => deleteMessageTemplate(tmpl.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate.id ? 'Edit Template' : 'New Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('common.name')}</Label>
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
              <Label>Trigger Event</Label>
              <Select
                value={editingTemplate.trigger}
                onValueChange={(v: any) =>
                  setEditingTemplate({ ...editingTemplate, trigger: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Trigger Only</SelectItem>
                  <SelectItem value="confirmation">
                    Booking Confirmation
                  </SelectItem>
                  <SelectItem value="check_in_24h">
                    24h Before Check-in
                  </SelectItem>
                  <SelectItem value="check_out_instructions">
                    Check-out Instructions
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Subject</Label>
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
              <Label>{t('common.description')}</Label>
              <Textarea
                value={editingTemplate.content}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    content: e.target.value,
                  })
                }
                className="h-32"
              />
              <div className="p-3 bg-muted rounded-md text-xs space-y-2">
                <p className="font-semibold text-muted-foreground">
                  Available placeholders:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <code className="bg-background px-1 rounded">
                    {'{GuestName}'}
                  </code>
                  <code className="bg-background px-1 rounded">
                    {'{CheckInDate}'}
                  </code>
                  <code className="bg-background px-1 rounded">
                    {'{CheckOutDate}'}
                  </code>
                  <code className="bg-background px-1 rounded">
                    {'{{property_address}}'}
                  </code>
                  <code className="bg-background px-1 rounded">
                    {'{{door_code}}'}
                  </code>
                  <code className="bg-background px-1 rounded">
                    {'{{condo_code}}'}
                  </code>
                  <code className="bg-background px-1 rounded">
                    {'{{pool_code}}'}
                  </code>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
