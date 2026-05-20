import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
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

export default function Properties() {
  const { t } = useDbTranslations()
  const { toast } = useToast()

  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<any>({})

  const fetchProperties = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setProperties(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({ status: 'available' })
    setIsOpen(true)
  }

  const handleOpenEdit = (property: any) => {
    setEditingId(property.id)
    setForm(property)
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.address) {
      toast({
        title: 'Error',
        description: 'Name and address are required',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      name: form.name,
      address: form.address,
      city: form.city,
      state: form.state,
      zip_code: form.zip_code,
      neighborhood: form.neighborhood,
      status: form.status,
    }

    if (editingId) {
      const { error } = await supabase
        .from('properties')
        .update(payload)
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
      const { error } = await supabase.from('properties').insert([payload])
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
    fetchProperties()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: t('common.success', 'Success') })
      fetchProperties()
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('properties.title', 'Properties')}
          </h1>
          <p className="text-slate-500">
            {t('properties.subtitle', 'Manage your properties')}
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-trust-blue text-white gap-2"
        >
          <Plus className="h-4 w-4" />{' '}
          {t('common.add_property', 'Add Property')}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? t('common.edit_property', 'Edit Property')
                : t('common.add_property', 'Add Property')}
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
              <Label htmlFor="address" className="text-right">
                {t('common.address', 'Address')}
              </Label>
              <Input
                id="address"
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="neighborhood" className="text-right">
                {t('common.neighborhood', 'Neighborhood')}
              </Label>
              <Input
                id="neighborhood"
                value={form.neighborhood || ''}
                onChange={(e) =>
                  setForm({ ...form, neighborhood: e.target.value })
                }
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
              <Label htmlFor="zip_code" className="text-right">
                {t('common.zip_code', 'Zip Code')}
              </Label>
              <Input
                id="zip_code"
                value={form.zip_code || ''}
                onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {t('common.status', 'Status')}
              </Label>
              <div className="col-span-3">
                <Select
                  value={form.status || 'available'}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.status', 'Status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">
                      {t('status.available', 'Available')}
                    </SelectItem>
                    <SelectItem value="occupied">
                      {t('status.occupied', 'Occupied')}
                    </SelectItem>
                    <SelectItem value="maintenance">
                      {t('status.maintenance', 'Maintenance')}
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
                  <TableHead>{t('table_header_name', 'Nome')}</TableHead>
                  <TableHead>{t('table_header_address', 'Endereço')}</TableHead>
                  <TableHead>{t('table_header_status', 'Status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions', 'Ações')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500"
                    >
                      {t('common.no_data', 'No data available')}
                    </TableCell>
                  </TableRow>
                ) : (
                  properties.map((property) => (
                    <TableRow
                      key={property.id}
                      className="hover:bg-slate-50/50"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {property.name}
                      </TableCell>
                      <TableCell className="text-slate-600 truncate max-w-xs">
                        {property.address}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            property.status === 'available'
                              ? 'default'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {t(
                            `status.${property.status}`,
                            property.status || 'Available',
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(property)}
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
                                  {t(
                                    'common.delete_property',
                                    'Delete Property',
                                  )}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    'common.delete_property_desc',
                                    'Are you sure you want to delete this property?',
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t('common.cancel', 'Cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(property.id)}
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
