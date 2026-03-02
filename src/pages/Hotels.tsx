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
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Building, Trash } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
import { DataMask } from '@/components/DataMask'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Hotel } from '@/lib/types'

export default function Hotels() {
  const {
    hotels,
    towers,
    addHotel,
    updateHotel,
    deleteHotel,
    addTower,
    updateTower,
    deleteTower,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Hotel | null>(null)

  type TowerState = {
    id: string
    name: string
    isNew?: boolean
    isDeleted?: boolean
  }
  const [form, setForm] = useState({
    name: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    towersList: [] as TowerState[],
  })

  const resetForm = () => {
    setForm({
      name: '',
      managerName: '',
      managerPhone: '',
      managerEmail: '',
      address: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      towersList: [],
    })
    setEditingRecord(null)
  }

  const handleEditClick = (h: Hotel) => {
    const hotelTowers = towers
      .filter((t) => t.hotelId === h.id)
      .map((t) => ({ id: t.id, name: t.name }))
    setForm({
      name: h.name,
      managerName: h.managerName || '',
      managerPhone: h.managerPhone || '',
      managerEmail: h.managerEmail || '',
      address: h.address || '',
      number: h.number || '',
      neighborhood: h.neighborhood || '',
      city: h.city || '',
      state: h.state || '',
      zipCode: h.zipCode || '',
      country: h.country || 'US',
      towersList: hotelTowers,
    })
    setEditingRecord(h)
    setIsAddOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.city) {
      toast({
        title: 'Validation Error',
        description: 'Name and City are required.',
        variant: 'destructive',
      })
      return
    }

    let hId = editingRecord?.id || `hotel-${Date.now()}`

    const hotelData = {
      id: hId,
      name: form.name,
      managerName: form.managerName,
      managerPhone: form.managerPhone,
      managerEmail: form.managerEmail,
      address: form.address,
      number: form.number,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      zipCode: form.zipCode,
      country: form.country,
      towers: form.towersList.filter((t) => !t.isDeleted).map((t) => t.id),
    }

    if (editingRecord) {
      updateHotel({ ...editingRecord, ...hotelData } as Hotel)
      toast({ title: 'Hotel updated successfully' })
    } else {
      addHotel(hotelData as Hotel)
      toast({ title: 'Hotel created successfully' })
    }

    // Sync Towers
    form.towersList.forEach((t) => {
      if (t.isDeleted && !t.isNew) {
        deleteTower(t.id)
      } else if (t.isNew && !t.isDeleted) {
        addTower({ id: t.id, hotelId: hId, name: t.name })
      } else if (!t.isNew && !t.isDeleted) {
        updateTower({ id: t.id, hotelId: hId, name: t.name })
      }
    })

    setIsAddOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    deleteHotel(id)
    toast({ title: 'Hotel deleted successfully' })
  }

  const addTowerField = () => {
    setForm((prev) => ({
      ...prev,
      towersList: [
        ...prev.towersList,
        { id: `tower-${Date.now()}`, name: '', isNew: true },
      ],
    }))
  }

  const removeTowerField = (id: string) => {
    setForm((prev) => ({
      ...prev,
      towersList: prev.towersList.map((t) =>
        t.id === id ? { ...t, isDeleted: true } : t,
      ),
    }))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building className="h-8 w-8 text-trust-blue" />
            {t('hotels.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('hotels.subtitle') || 'Manage your hotel properties and wings.'}
          </p>
        </div>
        <Dialog
          open={isAddOpen}
          onOpenChange={(v) => {
            setIsAddOpen(v)
            if (!v) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2 text-white">
              <Plus className="h-4 w-4" /> {t('hotels.add_title')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? t('common.edit') : t('hotels.add_title')}
              </DialogTitle>
              <DialogDescription>
                Define hotel details, full address, and internal divisions.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="towers">Towers / Wings</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>
                    Hotel Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="E.g. Grand Heritage Hotel"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('common.manager')}</Label>
                    <Input
                      placeholder={t('common.manager')}
                      value={form.managerName}
                      onChange={(e) =>
                        setForm({ ...form, managerName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('common.phone')}</Label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={form.managerPhone}
                      onChange={(e) =>
                        setForm({ ...form, managerPhone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.email')}</Label>
                  <Input
                    placeholder="manager@hotel.com"
                    value={form.managerEmail}
                    onChange={(e) =>
                      setForm({ ...form, managerEmail: e.target.value })
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>{t('common.country')}</Label>
                  <Select
                    value={form.country}
                    onValueChange={(val) => setForm({ ...form, country: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="BR">Brazil</SelectItem>
                      <SelectItem value="ES">Spain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="grid gap-2 col-span-3">
                    <Label>Street Address</Label>
                    <Input
                      placeholder="Street name"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2 col-span-1">
                    <Label>Number</Label>
                    <Input
                      placeholder="No."
                      value={form.number}
                      onChange={(e) =>
                        setForm({ ...form, number: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Neighborhood</Label>
                    <Input
                      placeholder="Neighborhood"
                      value={form.neighborhood}
                      onChange={(e) =>
                        setForm({ ...form, neighborhood: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="City"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>State / Province</Label>
                    <Input
                      placeholder="State"
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Zip Code</Label>
                    <Input
                      placeholder="Zip Code"
                      value={form.zipCode}
                      onChange={(e) =>
                        setForm({ ...form, zipCode: e.target.value })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="towers" className="space-y-4 py-4">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-muted-foreground">
                    Define internal divisions like Towers or Wings.
                  </Label>
                  <Button variant="outline" size="sm" onClick={addTowerField}>
                    <Plus className="h-4 w-4 mr-2" /> Add Division
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.towersList
                    .filter((t) => !t.isDeleted)
                    .map((t, i) => (
                      <div key={t.id} className="flex gap-2 items-center">
                        <Input
                          value={t.name}
                          onChange={(e) => {
                            const val = e.target.value
                            setForm((prev) => ({
                              ...prev,
                              towersList: prev.towersList.map((x) =>
                                x.id === t.id ? { ...x, name: val } : x,
                              ),
                            }))
                          }}
                          placeholder="e.g. Tower A, North Wing"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTowerField(t.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  {form.towersList.filter((t) => !t.isDeleted).length === 0 && (
                    <div className="text-center py-6 text-sm text-slate-500 border border-dashed rounded-md bg-slate-50">
                      No divisions added. Click "Add Division" to create one.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 border-t pt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} className="bg-trust-blue text-white">
                {t('common.save')}
              </Button>
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
                <TableHead>{t('common.address')}</TableHead>
                <TableHead>{t('common.manager')}</TableHead>
                <TableHead>{t('common.phone')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.map((h) => (
                <TableRow key={h.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{h.name}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>
                      {h.address}
                      {h.number ? `, ${h.number}` : ''}, {h.city}, {h.state}
                    </DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{h.managerName || 'N/A'}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{h.managerPhone || 'N/A'}</DataMask>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(h)}
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
                            <AlertDialogTitle>Delete Hotel</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Are you sure you
                              want to permanently delete this hotel?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(h.id)}
                            >
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {hotels.length === 0 && (
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
