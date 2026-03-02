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
import { Plus, Pencil, Trash2, MoreHorizontal, Eye } from 'lucide-react'
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
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'
import { Visit } from '@/lib/types'
import { DataMask } from '@/components/DataMask'

export default function Visits() {
  const { visits, addVisit, updateVisit, deleteVisit } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Visit | null>(null)
  const [form, setForm] = useState<Partial<Visit>>({
    clientName: '',
    propertyName: '',
    date: new Date().toISOString().slice(0, 16),
    reason: 'showing',
    status: 'scheduled',
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredVisits = visits.filter(
    (v) =>
      v.clientName.toLowerCase().includes(search.toLowerCase()) ||
      v.propertyName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = () => {
    if (!form.clientName || !form.propertyName) {
      toast({ title: t('common.error'), variant: 'destructive' })
      return
    }

    if (editingRecord) {
      updateVisit({ ...editingRecord, ...form } as Visit)
      toast({ title: t('common.success') })
    } else {
      addVisit({
        id: `v-${Date.now()}`,
        clientName: form.clientName,
        propertyName: form.propertyName,
        propertyId: 'p1', // mock
        date: form.date || new Date().toISOString(),
        reason: form.reason || 'showing',
        status: form.status || 'scheduled',
      } as Visit)
      toast({ title: t('common.success') })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm({
      clientName: '',
      propertyName: '',
      date: '',
      reason: 'showing',
      status: 'scheduled',
    })
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteVisit(deleteId)
      toast({ title: t('common.delete_success') })
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('common.visits')}
          </h1>
          <p className="text-muted-foreground">
            Manage scheduled property visits.
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
                setForm({
                  clientName: '',
                  propertyName: '',
                  date: '',
                  reason: 'showing',
                  status: 'scheduled',
                })
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
                  <Label>{t('common.client_name')}</Label>
                  <Input
                    value={form.clientName}
                    onChange={(e) =>
                      setForm({ ...form, clientName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.property')}</Label>
                  <Input
                    value={form.propertyName}
                    onChange={(e) =>
                      setForm({ ...form, propertyName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.date')}</Label>
                  <Input
                    type="datetime-local"
                    value={
                      form.date
                        ? new Date(form.date).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: new Date(e.target.value).toISOString(),
                      })
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
                <TableHead>{t('common.client_name')}</TableHead>
                <TableHead>{t('common.property')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.map((visit) => (
                <TableRow key={visit.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{visit.clientName}</DataMask>
                  </TableCell>
                  <TableCell>{visit.propertyName}</TableCell>
                  <TableCell>
                    {format(new Date(visit.date), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="capitalize">{visit.reason}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{visit.status}</Badge>
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
                            setEditingRecord(visit)
                            setForm(visit)
                            setIsAddOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(visit.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />{' '}
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredVisits.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
