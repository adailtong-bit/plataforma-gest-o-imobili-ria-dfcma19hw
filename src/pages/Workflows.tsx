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
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Workflow } from '@/lib/types'

export default function Workflows() {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow } =
    useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Workflow | null>(null)
  const [form, setForm] = useState<Partial<Workflow>>({
    name: '',
    trigger: 'manual',
    active: true,
  })

  const handleSave = () => {
    if (!form.name) {
      toast({ title: t('common.error'), variant: 'destructive' })
      return
    }

    if (editingRecord) {
      updateWorkflow({ ...editingRecord, ...form } as Workflow)
      toast({ title: t('common.success') })
    } else {
      addWorkflow({
        id: `wf-${Date.now()}`,
        name: form.name,
        description: form.description || '',
        trigger: form.trigger || 'manual',
        steps: [],
        active: form.active ?? true,
      } as Workflow)
      toast({ title: t('common.success') })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm({ name: '', trigger: 'manual', active: true })
  }

  const handleDelete = (id: string) => {
    deleteWorkflow(id)
    toast({ title: t('common.delete_success') })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('common.workflows')}
          </h1>
          <p className="text-muted-foreground">
            Manage automated task workflows.
          </p>
        </div>
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
              <Plus className="h-4 w-4" /> {t('common.add_title')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? t('common.edit') : t('common.add_title')}
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
                <Label>Trigger</Label>
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

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Steps Count</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((wf) => (
                <TableRow key={wf.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {wf.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {wf.trigger}
                  </TableCell>
                  <TableCell>{wf.steps?.length || 0}</TableCell>
                  <TableCell>
                    <Badge variant={wf.active ? 'default' : 'secondary'}>
                      {wf.active ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingRecord(wf)
                          setForm(wf)
                          setIsAddOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('common.delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('common.delete_title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('common.delete_desc')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(wf.id)}
                            >
                              {t('common.confirm')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {workflows.length === 0 && (
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
    </div>
  )
}
