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
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
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

export default function Hotels() {
  const { t } = useDbTranslations()
  const { toast } = useToast()

  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<any>({})

  const fetchHotels = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setHotels(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({})
    setIsOpen(true)
  }

  const handleOpenEdit = (hotel: any) => {
    setEditingId(hotel.id)
    setForm(hotel)
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.city) {
      toast({
        title: 'Error',
        description: 'Name and city are required',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      name: form.name,
      city: form.city,
      address: form.address,
      manager_name: form.manager_name,
      manager_email: form.manager_email,
      manager_phone: form.manager_phone,
    }

    if (editingId) {
      const { error } = await supabase
        .from('hotels')
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
      const { error } = await supabase.from('hotels').insert([payload])
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
    fetchHotels()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('hotels').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: t('common.success', 'Success') })
      fetchHotels()
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('hotels.title', 'Hotels')}
          </h1>
          <p className="text-slate-500">
            {t('hotels.subtitle', 'Manage your hotels')}
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-trust-blue text-white gap-2"
        >
          <Plus className="h-4 w-4" /> {t('common.add_hotel', 'Add Hotel')}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? t('common.edit_hotel', 'Edit Hotel')
                : t('common.add_hotel', 'Add Hotel')}
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
              <Label htmlFor="manager_name" className="text-right">
                {t('common.manager_name', 'Manager Name')}
              </Label>
              <Input
                id="manager_name"
                value={form.manager_name || ''}
                onChange={(e) =>
                  setForm({ ...form, manager_name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manager_email" className="text-right">
                {t('common.email', 'Email')}
              </Label>
              <Input
                id="manager_email"
                type="email"
                value={form.manager_email || ''}
                onChange={(e) =>
                  setForm({ ...form, manager_email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manager_phone" className="text-right">
                {t('common.phone', 'Phone')}
              </Label>
              <Input
                id="manager_phone"
                value={form.manager_phone || ''}
                onChange={(e) =>
                  setForm({ ...form, manager_phone: e.target.value })
                }
                className="col-span-3"
              />
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
                  <TableHead>{t('table_header_city', 'Cidade')}</TableHead>
                  <TableHead>{t('table_header_manager', 'Gerente')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions', 'Ações')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500"
                    >
                      {t('common.no_data', 'No data available')}
                    </TableCell>
                  </TableRow>
                ) : (
                  hotels.map((hotel) => (
                    <TableRow key={hotel.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {hotel.name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {hotel.city}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {hotel.manager_name ||
                          t('common.unassigned', 'Não atribuído')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(hotel)}
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
                                  {t('common.delete_hotel', 'Delete Hotel')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    'common.delete_hotel_desc',
                                    'Are you sure you want to delete this hotel?',
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t('common.cancel', 'Cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(hotel.id)}
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
