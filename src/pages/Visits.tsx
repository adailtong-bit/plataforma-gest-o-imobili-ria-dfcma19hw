import { useState, useEffect } from 'react'
import useVisitStore from '@/stores/useVisitStore'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'
import { DataMask } from '@/components/DataMask'
import { supabase } from '@/lib/supabase/client'

export default function Visits() {
  const { visits, addVisit, updateVisit, deleteVisit } = useVisitStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any | null>(null)
  const [form, setForm] = useState<any>({
    visitorName: '',
    visitorDocument: '',
    propertyId: 'none',
    visitDate: new Date().toISOString().slice(0, 16),
    purpose: 'showing',
    status: 'scheduled',
    notes: '',
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('properties')
      .select('id, name')
      .then(({ data }) => setProperties(data || []))
  }, [])

  const filteredVisits = visits.filter(
    (v) =>
      (v.visitorName || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.propertyName || '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = async () => {
    if (!form.visitorName) {
      toast({ title: t('common.error') || 'Error', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)

    const payload = {
      ...form,
      propertyId: form.propertyId === 'none' ? null : form.propertyId,
    }

    const finalPayload = {
      ...payload,
      visit_date: form.visitDate || new Date().toISOString(),
      visitDate: form.visitDate || new Date().toISOString(),
      date: form.visitDate || new Date().toISOString(),
    }

    if (editingRecord) {
      await updateVisit({ ...editingRecord, ...finalPayload })
      toast({ title: t('common.success', 'Success') })
    } else {
      await addVisit(finalPayload)
      toast({ title: t('common.success', 'Success') })
    }

    setIsSubmitting(false)
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm({
      visitorName: '',
      visitorDocument: '',
      propertyId: 'none',
      visitDate: new Date().toISOString().slice(0, 16),
      purpose: 'showing',
      status: 'scheduled',
      notes: '',
    })
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteVisit(deleteId)
      toast({ title: t('common.delete_success') || 'Deleted successfully' })
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('common.visits', 'Visits')}
          </h1>
          <p className="text-muted-foreground">
            {t('visits.subtitle', 'Manage scheduled property visits.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('common.search', 'Search')}
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
                  visitorName: '',
                  visitorDocument: '',
                  propertyId: 'none',
                  visitDate: new Date().toISOString().slice(0, 16),
                  purpose: 'showing',
                  status: 'scheduled',
                  notes: '',
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white">
                <Plus className="h-4 w-4" /> {t('common.add', 'Add')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord
                    ? t('common.edit', 'Edit')
                    : t('common.add', 'Add')}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label>{t('common.visitor_name', 'Visitor Name')}</Label>
                    <Input
                      value={form.visitorName}
                      onChange={(e) =>
                        setForm({ ...form, visitorName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label>{t('common.visitor_document', 'Document')}</Label>
                    <Input
                      value={form.visitorDocument}
                      onChange={(e) =>
                        setForm({ ...form, visitorDocument: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('common.property', 'Property')}</Label>
                  <Select
                    value={form.propertyId}
                    onValueChange={(val) =>
                      setForm({ ...form, propertyId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label>{t('common.date', 'Date')}</Label>
                    <Input
                      type="datetime-local"
                      value={
                        form.visitDate
                          ? new Date(form.visitDate).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          visitDate: new Date(e.target.value).toISOString(),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label>{t('common.status', 'Status')}</Label>
                    <Select
                      value={form.status}
                      onValueChange={(val) => setForm({ ...form, status: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">
                          {t('common.scheduled', 'Scheduled')}
                        </SelectItem>
                        <SelectItem value="completed">
                          {t('common.completed', 'Completed')}
                        </SelectItem>
                        <SelectItem value="cancelled">
                          {t('common.cancelled', 'Cancelled')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('common.purpose', 'Purpose')}</Label>
                  <Select
                    value={form.purpose}
                    onValueChange={(val) => setForm({ ...form, purpose: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="showing">
                        {t('common.showing', 'Showing')}
                      </SelectItem>
                      <SelectItem value="inspection">
                        {t('common.inspection', 'Inspection')}
                      </SelectItem>
                      <SelectItem value="maintenance">
                        {t('common.maintenance', 'Maintenance')}
                      </SelectItem>
                      <SelectItem value="other">
                        {t('common.other', 'Other')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('common.notes', 'Notes')}</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {t('common.save', 'Save')}
                </Button>
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
                <TableHead>
                  {t('common.visitor_name', 'Visitor Name')}
                </TableHead>
                <TableHead>{t('common.property', 'Property')}</TableHead>
                <TableHead>{t('common.date', 'Date')}</TableHead>
                <TableHead>{t('common.purpose', 'Purpose')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.map((visit) => (
                <TableRow key={visit.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{visit.visitorName}</DataMask>
                  </TableCell>
                  <TableCell>{visit.propertyName}</TableCell>
                  <TableCell>
                    {format(
                      new Date(
                        visit.visitDate || visit.visit_date || visit.date,
                      ),
                      'MMM dd, yyyy HH:mm',
                    )}
                  </TableCell>
                  <TableCell className="capitalize">
                    {t(`common.${visit.purpose}`, visit.purpose)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        visit.status === 'scheduled'
                          ? 'outline'
                          : visit.status === 'completed'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {t(`common.${visit.status}`, visit.status)}
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
                            setEditingRecord(visit)
                            setForm({
                              ...visit,
                              propertyId: visit.propertyId || 'none',
                              visitDate: new Date(
                                visit.visitDate ||
                                  visit.visit_date ||
                                  visit.date,
                              )
                                .toISOString()
                                .slice(0, 16),
                            })
                            setIsAddOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />{' '}
                          {t('common.edit', 'Edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(visit.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />{' '}
                          {t('common.delete', 'Delete')}
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
                    {t('common.empty', 'No records found.')}
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
            <AlertDialogTitle>
              {t('common.confirm_delete', 'Confirm Deletion')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'common.delete_desc',
                'Are you sure you want to delete this record?',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
