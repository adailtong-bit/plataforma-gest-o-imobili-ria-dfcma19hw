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
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
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
import { Link } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'

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
          address: form.address,
          city: form.city,
          state: form.state,
          zip_code: form.zip_code,
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

        // update extra fields not handled by RPC
        if (form.address || form.zip_code) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', form.email)
            .single()
          if (newProfile) {
            await supabase
              .from('profiles')
              .update({
                address: form.address,
                zip_code: form.zip_code,
              })
              .eq('id', newProfile.id)
          }
        }
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

  const formatAddress = (owner: any) => {
    const parts = [
      owner.address,
      owner.city,
      owner.state,
      owner.zip_code,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : '-'
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('sidebar.owners', 'Owners')}
          </h1>
          <p className="text-slate-500">
            {t('owners.subtitle', 'Manage your property owners')}
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>
              {editingId
                ? t('common.edit_owner', 'Edit Owner')
                : t('common.add_owner', 'Add Owner')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-sm border-b pb-2">
                  {t('common.personal_info', 'Personal Info')}
                </h4>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('common.name', 'Name')}</Label>
                    <Input
                      id="name"
                      value={form.name || ''}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">
                      {t('common.tax_id_label', 'Tax ID / Document')}
                    </Label>
                    <Input
                      id="document"
                      value={form.document || ''}
                      onChange={(e) =>
                        setForm({ ...form, document: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('common.email', 'Email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email || ''}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      disabled={!!editingId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('common.phone', 'Phone')}</Label>
                    <Input
                      id="phone"
                      value={form.phone || ''}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm border-b pb-2">
                  {t('common.address_info', 'Address Info')}
                </h4>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address">
                      {t('common.address', 'Street Address')}
                    </Label>
                    <Input
                      id="address"
                      value={form.address || ''}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('common.city', 'City')}</Label>
                    <Input
                      id="city"
                      value={form.city || ''}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">{t('common.state', 'State')}</Label>
                    <Input
                      id="state"
                      value={form.state || ''}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">
                      {t('common.zip_code', 'Zip Code')}
                    </Label>
                    <Input
                      id="zip_code"
                      value={form.zip_code || ''}
                      onChange={(e) =>
                        setForm({ ...form, zip_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      {t('common.status', 'Status')}
                    </Label>
                    <Select
                      value={form.status || 'active'}
                      onValueChange={(v) => setForm({ ...form, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('common.status', 'Status')}
                        />
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
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 border-t mt-auto">
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
                  <TableHead>{t('common.name', 'Name')}</TableHead>
                  <TableHead>{t('common.contact', 'Contact')}</TableHead>
                  <TableHead>{t('common.location', 'Address')}</TableHead>
                  <TableHead>{t('common.tax_id_label', 'Tax ID')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owners.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                        <div className="flex flex-col">
                          <span className="text-sm">{owner.email}</span>
                          <span className="text-xs text-slate-500">
                            {owner.phone || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-[200px] truncate">
                        {formatAddress(owner)}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {owner.document || '-'}
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
                          <Link to={`/owners/${owner.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />{' '}
                              {t('common.view', 'View')}
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(owner)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
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
