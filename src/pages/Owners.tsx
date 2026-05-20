import { useEffect, useState } from 'react'
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
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

export default function Owners() {
  const { t } = useDbTranslations()
  const { toast } = useToast()

  const [owners, setOwners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<any>({})

  const fetchOwners = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'property_owner')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setOwners(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOwners()
  }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({ status: 'active' })
    setIsOpen(true)
  }

  const handleOpenEdit = (owner: any) => {
    setEditingId(owner.id)
    setForm(owner)
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast({
        title: 'Error',
        description: 'Name and email are required',
        variant: 'destructive',
      })
      return
    }

    if (editingId) {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          email: form.email,
          phone: form.phone,
          document: form.document,
          city: form.city,
          state: form.state,
          status: form.status,
        })
        .eq('id', editingId)

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({ title: t('common.success', 'Success') })
      }
    } else {
      const { error } = await supabase.rpc('create_user_profile', {
        p_email: form.email,
        p_password: 'Password123!',
        p_name: form.name,
        p_role: 'property_owner',
        p_phone: form.phone || null,
        p_document: form.document || null,
        p_city: form.city || null,
        p_state: form.state || null,
        p_status: form.status || 'active',
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({ title: t('common.success', 'Success') })
      }
    }
    setIsOpen(false)
    fetchOwners()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: t('common.success', 'Success') })
      fetchOwners()
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('sidebar.owners', 'Owners')}
          </h1>
          <p className="text-slate-500">
            {t('owners.subtitle', 'Manage your owners')}
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-trust-blue text-white gap-2"
        >
          <Plus className="h-4 w-4" /> {t('common.add_owner', 'Add Owner')}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? t('common.edit_owner', 'Edit Owner')
                : t('common.add_owner', 'Add Owner')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('common.name', 'Name')}
              </Label>
              <Input
                id="name"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t('common.email', 'Email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="col-span-3"
                disabled={!!editingId}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right">
                {t('common.tax_id_label', 'CPF/CNPJ')}
              </Label>
              <Input
                id="document"
                value={form.document || ''}
                onChange={(e) => setForm({ ...form, document: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                {t('common.phone', 'Phone')}
              </Label>
              <Input
                id="phone"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                {t('common.city', 'City')}
              </Label>
              <Input
                id="city"
                value={form.city || ''}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">
                {t('common.state', 'State')}
              </Label>
              <Input
                id="state"
                value={form.state || ''}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {t('common.status', 'Status')}
              </Label>
              <div className="col-span-3">
                <Select
                  value={form.status || 'active'}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.status', 'Status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t('status.active', 'Active')}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t('status.inactive', 'Inactive')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} className="bg-trust-blue text-white">
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>{t('common.name', 'Nome')}</TableHead>
                  <TableHead>{t('common.tax_id_label', 'CPF/CNPJ')}</TableHead>
                  <TableHead>{t('common.email', 'E-mail')}</TableHead>
                  <TableHead>{t('common.phone', 'Telefone')}</TableHead>
                  <TableHead>{t('common.location', 'Localização')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions', 'Ações')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owners.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-slate-500"
                    >
                      {t('common.no_data', 'No data available')}
                    </TableCell>
                  </TableRow>
                ) : (
                  owners.map((owner) => (
                    <TableRow key={owner.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {owner.name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {owner.document || '-'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {owner.email}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {owner.phone || '-'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {owner.city
                          ? `${owner.city}${owner.state ? `, ${owner.state}` : ''}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            owner.status === 'active' ? 'default' : 'secondary'
                          }
                          className="capitalize"
                        >
                          {t(
                            `status.${owner.status}`,
                            owner.status || 'Active',
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(owner)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />{' '}
                            {t('common.edit', 'Edit')}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />{' '}
                                {t('common.delete', 'Delete')}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t('common.delete_owner', 'Delete Owner')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    'common.delete_owner_desc',
                                    'Are you sure you want to delete this owner?',
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t('common.cancel', 'Cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(owner.id)}
                                >
                                  {t('common.delete', 'Delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
