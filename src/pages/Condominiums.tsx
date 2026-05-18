import { useContext, useState } from 'react'
import { AppContext } from '@/stores/AppContext'
import useAuthStore from '@/stores/useAuthStore'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Condominium, User } from '@/lib/types'
import { Link } from 'react-router-dom'
import { DataMask } from '@/components/DataMask'

export default function Condominiums() {
  const { condominiums, addCondominium, updateCondominium, deleteCondominium } =
    useContext(AppContext)!
  const { currentUser, hasPermissionSync } = useAuthStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const canCreate = hasPermissionSync(
    currentUser as User,
    'condominiums',
    'create',
  )
  const canEdit = hasPermissionSync(currentUser as User, 'condominiums', 'edit')
  const canDelete = hasPermissionSync(
    currentUser as User,
    'condominiums',
    'delete',
  )

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Condominium | null>(null)

  const [form, setForm] = useState<Partial<Condominium>>({
    name: '',
    description: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    accessCredentials: {
      gate: '',
      pedestrianGate: '',
      poolCode: '',
      amenities: '',
    },
  })

  const filteredCondos = condominiums.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase()),
  )

  const updateAccess = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      accessCredentials: {
        ...prev.accessCredentials,
        [field]: value,
      },
    }))
  }

  const handleSave = () => {
    if (!form.name) {
      toast({
        title: t('common.error'),
        description: t('common.name_required'),
        variant: 'destructive',
      })
      return
    }

    const payload: Condominium = {
      ...(editingRecord || { id: `condo-${Date.now()}` }),
      name: form.name,
      description: form.description,
      address: form.address || '',
      number: form.number,
      complement: form.complement,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      zipCode: form.zipCode,
      country: form.country,
      managerName: form.managerName,
      managerPhone: form.managerPhone,
      managerEmail: form.managerEmail,
      accessCredentials: form.accessCredentials,
    }

    if (editingRecord) {
      updateCondominium(payload)
      toast({ title: t('common.success'), description: t('common.success') })
    } else {
      addCondominium(payload)
      toast({ title: t('common.success'), description: t('common.success') })
    }

    setIsAddOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setEditingRecord(null)
    setForm({
      name: '',
      description: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      managerName: '',
      managerPhone: '',
      managerEmail: '',
      accessCredentials: {
        gate: '',
        pedestrianGate: '',
        poolCode: '',
        amenities: '',
      },
    })
  }

  const handleEditClick = (condo: Condominium) => {
    setEditingRecord(condo)
    setForm({
      name: condo.name,
      description: condo.description || '',
      address: condo.address,
      number: condo.number || '',
      complement: condo.complement || '',
      neighborhood: condo.neighborhood || '',
      city: condo.city || '',
      state: condo.state || '',
      zipCode: condo.zipCode || '',
      country: condo.country || 'US',
      managerName: condo.managerName || '',
      managerPhone: condo.managerPhone || '',
      managerEmail: condo.managerEmail || '',
      accessCredentials: {
        gate: condo.accessCredentials?.gate || '',
        pedestrianGate: condo.accessCredentials?.pedestrianGate || '',
        poolCode: condo.accessCredentials?.poolCode || '',
        amenities: condo.accessCredentials?.amenities || '',
      },
    })
    setIsAddOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteCondominium(id)
    toast({ title: t('common.delete_success') })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('condominiums.title')}
          </h1>
          <p className="text-muted-foreground">{t('condominiums.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('condominiums.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 bg-white"
          />
          {canCreate && (
            <Dialog
              open={isAddOpen}
              onOpenChange={(v) => {
                setIsAddOpen(v)
                if (!v) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-trust-blue gap-2 text-white">
                  <Plus className="h-4 w-4" /> {t('condominiums.new_condo')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecord
                      ? t('condominiums.edit_condo')
                      : t('condominiums.add_title')}
                  </DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="general" className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">
                      {t('condominiums.general_info')}
                    </TabsTrigger>
                    <TabsTrigger value="addressing">
                      {t('condominiums.addressing')}
                    </TabsTrigger>
                    <TabsTrigger value="access">
                      {t('condominiums.access_codes')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label>
                        {t('common.name')}{' '}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('condominiums.description')}</Label>
                      <Input
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t('condominiums.manager_name')}</Label>
                        <Input
                          value={form.managerName}
                          onChange={(e) =>
                            setForm({ ...form, managerName: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('condominiums.manager_phone')}</Label>
                        <Input
                          value={form.managerPhone}
                          onChange={(e) =>
                            setForm({ ...form, managerPhone: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2 col-span-2">
                        <Label>{t('condominiums.manager_email')}</Label>
                        <Input
                          value={form.managerEmail}
                          onChange={(e) =>
                            setForm({ ...form, managerEmail: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="addressing" className="space-y-4 py-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="grid gap-2 col-span-4">
                        <Label>{t('condominiums.street')}</Label>
                        <Input
                          value={form.address}
                          onChange={(e) =>
                            setForm({ ...form, address: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t('condominiums.complement')}</Label>
                        <Input
                          value={form.complement}
                          onChange={(e) =>
                            setForm({ ...form, complement: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('condominiums.neighborhood')}</Label>
                        <Input
                          value={form.neighborhood}
                          onChange={(e) =>
                            setForm({ ...form, neighborhood: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>{t('condominiums.city')}</Label>
                        <Input
                          value={form.city}
                          onChange={(e) =>
                            setForm({ ...form, city: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('condominiums.state')}</Label>
                        <Input
                          value={form.state}
                          onChange={(e) =>
                            setForm({ ...form, state: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('condominiums.zip_code')}</Label>
                        <Input
                          value={form.zipCode}
                          onChange={(e) =>
                            setForm({ ...form, zipCode: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="access" className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t('condominiums.gate_code')}</Label>
                        <Input
                          value={form.accessCredentials?.gate || ''}
                          onChange={(e) => updateAccess('gate', e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('condominiums.pedestrian_gate')}</Label>
                        <Input
                          value={form.accessCredentials?.pedestrianGate || ''}
                          onChange={(e) =>
                            updateAccess('pedestrianGate', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('condominiums.pool_code')}</Label>
                        <Input
                          value={form.accessCredentials?.poolCode || ''}
                          onChange={(e) =>
                            updateAccess('poolCode', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('condominiums.amenities_code')}</Label>
                        <Input
                          value={form.accessCredentials?.amenities || ''}
                          onChange={(e) =>
                            updateAccess('amenities', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter className="mt-6 border-t pt-4">
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-trust-blue text-white"
                  >
                    {t('common.save')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('condominiums.addressing')}</TableHead>
                <TableHead>{t('common.manager_col')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCondos.map((condo) => (
                <TableRow key={condo.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{condo.name}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>
                      {condo.address}
                      {condo.city ? ` - ${condo.city}` : ''}
                    </DataMask>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-slate-900">
                        <DataMask>{condo.managerName || '-'}</DataMask>
                      </span>
                      <span className="text-slate-500">
                        <DataMask>{condo.managerPhone || ''}</DataMask>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/condominiums/${condo.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" /> {t('common.view')}
                        </Button>
                      </Link>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(condo)}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
                        </Button>
                      )}
                      {canDelete && (
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
                                {t('condominiums.delete_confirm')}
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
                                onClick={() => handleDelete(condo.id)}
                              >
                                {t('common.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCondos.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('condominiums.no_condos')}
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
