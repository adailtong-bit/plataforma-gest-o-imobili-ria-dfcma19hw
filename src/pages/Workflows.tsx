import { useContext, useState } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { Workflow } from '@/lib/types'
import { DataMask } from '@/components/DataMask'

export default function Workflows() {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow } =
    useContext(AppContext)!
  const { t } = useDbTranslations()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Workflow | null>(null)
  const [form, setForm] = useState<Partial<Workflow>>({
    name: '',
    trigger: 'manual',
    active: true,
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredWorkflows = (workflows || []).filter((wf) =>
    (wf?.name || '').toLowerCase().includes(search?.toLowerCase() || ''),
  )

  const handleSave = () => {
    if (!form.name) {
      toast({ title: t('common.error'), variant: 'destructive' })
      return
    }

    if (editingRecord) {
      updateWorkflow({ ...editingRecord, ...form } as Workflow)
      toast({ title: t('common.success', 'Success') })
    } else {
      addWorkflow({
        id: `wf-${Date.now()}`,
        name: form.name,
        description: form.description || '',
        trigger: form.trigger || 'manual',
        steps: [],
        active: form.active ?? true,
      } as Workflow)
      toast({ title: t('common.success', 'Success') })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm({ name: '', trigger: 'manual', active: true })
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteWorkflow(deleteId)
      toast({ title: t('common.delete_success') })
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('common.workflows', 'Workflows')}
          </h1>
          <p className="text-muted-foreground">
            {t('workflows.subtitle', 'Manage automated task workflows.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingRecord(null)
                setForm({ name: '', trigger: 'manual', active: true })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white">
                <Plus className="h-4 w-4" /> {t('common.add')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? t('common.edit') : t('common.add')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('common.name')}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('workflows.trigger', 'Trigger')}</Label>
                  <Input
                    value={form.trigger}
                    onChange={(e) =>
                      setForm({ ...form, trigger: e.target.value as any })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave}>{t('common.save')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('workflows.trigger', 'Trigger')}</TableHead>
                <TableHead>
                  {t('workflows.steps_count', 'Steps Count')}
                </TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.map((wf) => (
                <TableRow key={wf.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{wf.name}</DataMask>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {t(`workflows.trigger.${wf.trigger}`, wf.trigger)}
                  </TableCell>
                  <TableCell>{wf.steps?.length || 0}</TableCell>
                  <TableCell>
                    <Badge variant={wf.active ? 'default' : 'secondary'}>
                      {wf.active ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingRecord(wf)
                            setForm(wf)
                            setIsAddOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(wf.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />{' '}
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredWorkflows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.delete_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
