import { useState } from 'react'
import useHotelStore from '@/stores/useHotelStore'
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
import { Plus, Pencil, Trash2, Building, Trash, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
import { applyPhoneMask } from '@/lib/utils'

export default function Hotels() {
  const {
    hotels = [],
    towers = [],
    addHotel,
    updateHotel,
    deleteHotel,
    addTower,
    updateTower,
    deleteTower,
  } = useHotelStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const safeT =
    typeof t === 'function'
      ? t
      : (key: string, fallback?: string) => fallback || key

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
      .filter((tower) => tower.hotelId === h.id)
      .map((tower) => ({ id: tower.id, name: tower.name }))
    setForm({
      name: h.name || '',
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

  const handleSave = async () => {
    if (!form.name || !form.city) {
      toast({
        title: safeT('hotel_form.validation_error'),
        description: safeT('hotel_form.validation_error'),
        variant: 'destructive',
      })
      return
    }

    let hId = editingRecord?.id

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
      towers: form.towersList
        .filter((tower) => !tower.isDeleted)
        .map((tower) => tower.id),
    }

    if (editingRecord && updateHotel) {
      await updateHotel({ ...editingRecord, ...hotelData } as Hotel)
      toast({ title: safeT('common.save') })
    } else if (addHotel) {
      const newHotel = await addHotel(hotelData as Hotel)
      if (newHotel) {
        hId = newHotel.id
      }
      toast({ title: safeT('common.success') })
    }

    if (hId) {
      // Sync Towers
      for (const tower of form.towersList) {
        if (tower.isDeleted && !tower.isNew && deleteTower) {
          await deleteTower(tower.id)
        } else if (tower.isNew && !tower.isDeleted && addTower) {
          await addTower({ hotelId: hId, name: tower.name })
        } else if (!tower.isNew && !tower.isDeleted && updateTower) {
          await updateTower({ id: tower.id, hotelId: hId, name: tower.name })
        }
      }
    }

    setIsAddOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (deleteHotel) {
      deleteHotel(id)
      toast({ title: safeT('common.delete_success') })
    }
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
      towersList: prev.towersList.map((tower) =>
        tower.id === id ? { ...tower, isDeleted: true } : tower,
      ),
    }))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building className="h-8 w-8 text-trust-blue" />
            {safeT('hotels.title')}
          </h1>
          <p className="text-muted-foreground">{safeT('hotels.subtitle')}</p>
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
              <Plus className="h-4 w-4" />{' '}
              {safeT('hotels.add_title', 'Add Hotel')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord
                  ? safeT('common.edit')
                  : safeT('hotels.add_title')}
              </DialogTitle>
              <DialogDescription>
                {safeT('hotel_form.define_divisions')}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">
                  {safeT('hotel_form.details')}
                </TabsTrigger>
                <TabsTrigger value="location">
                  {safeT('hotel_form.location')}
                </TabsTrigger>
                <TabsTrigger value="towers">
                  {safeT('hotel_form.towers_wings')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>
                    {safeT('hotel_form.hotel_name')}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder={safeT('hotel_form.placeholder_name')}
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{safeT('common.manager')}</Label>
                    <Input
                      placeholder={safeT('common.manager')}
                      value={form.managerName || ''}
                      onChange={(e) =>
                        setForm({ ...form, managerName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{safeT('common.phone')}</Label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={form.managerPhone || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          managerPhone: applyPhoneMask(
                            e.target.value,
                            (form.country as 'US' | 'BR' | 'ES') || 'US',
                          ),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>{safeT('common.email')}</Label>
                  <Input
                    placeholder="manager@hotel.com"
                    value={form.managerEmail || ''}
                    onChange={(e) =>
                      setForm({ ...form, managerEmail: e.target.value })
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>{safeT('common.country')}</Label>
                  <Select
                    value={form.country || 'US'}
                    onValueChange={(val) => setForm({ ...form, country: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">
                        {safeT('common.country_us')}
                      </SelectItem>
                      <SelectItem value="BR">
                        {safeT('common.country_br')}
                      </SelectItem>
                      <SelectItem value="ES">
                        {safeT('common.country_es')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="grid gap-2 col-span-4">
                    <Label>{safeT('hotel_form.street_address')}</Label>
                    <Input
                      placeholder={safeT('hotel_form.street_address')}
                      value={form.address || ''}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{safeT('hotel_form.neighborhood')}</Label>
                    <Input
                      placeholder={safeT('hotel_form.neighborhood')}
                      value={form.neighborhood || ''}
                      onChange={(e) =>
                        setForm({ ...form, neighborhood: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      {safeT('hotel_form.city')}{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder={safeT('hotel_form.city')}
                      value={form.city || ''}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{safeT('hotel_form.state')}</Label>
                    <Input
                      placeholder={safeT('hotel_form.state')}
                      value={form.state || ''}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{safeT('hotel_form.zip_code')}</Label>
                    <Input
                      placeholder={safeT('hotel_form.zip_code')}
                      value={form.zipCode || ''}
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
                    {safeT('hotel_form.define_divisions')}
                  </Label>
                  <Button variant="outline" size="sm" onClick={addTowerField}>
                    <Plus className="h-4 w-4 mr-2" />{' '}
                    {safeT('hotel_form.add_division')}
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.towersList
                    .filter((tower) => !tower.isDeleted)
                    .map((tower, i) => (
                      <div key={tower.id} className="flex gap-2 items-center">
                        <Input
                          value={tower.name || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setForm((prev) => ({
                              ...prev,
                              towersList: prev.towersList.map((x) =>
                                x.id === tower.id ? { ...x, name: val } : x,
                              ),
                            }))
                          }}
                          placeholder={safeT('hotel_form.towers_wings')}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTowerField(tower.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  {form.towersList.filter((tower) => !tower.isDeleted)
                    .length === 0 && (
                    <div className="text-center py-6 text-sm text-slate-500 border border-dashed rounded-md bg-slate-50">
                      {safeT('hotel_form.no_divisions')}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 border-t pt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                {safeT('common.cancel')}
              </Button>
              <Button onClick={handleSave} className="bg-trust-blue text-white">
                {safeT('common.save')}
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
                <TableHead>{safeT('common.name')}</TableHead>
                <TableHead>{safeT('common.address')}</TableHead>
                <TableHead>{safeT('common.manager')}</TableHead>
                <TableHead>{safeT('common.phone')}</TableHead>
                <TableHead className="text-right">
                  {safeT('common.actions')}
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
                      {h.city ? `, ${h.city}` : ''}
                      {h.state ? `, ${h.state}` : ''}
                    </DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{h.managerName || 'N/A'}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>
                      {h.managerPhone
                        ? applyPhoneMask(
                            h.managerPhone,
                            (h.country as 'US' | 'BR' | 'ES') || 'US',
                          )
                        : 'N/A'}
                    </DataMask>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-trust-blue text-white"
                        onClick={() => navigate(`/hotels/${h.id}`)}
                      >
                        <Settings className="h-4 w-4 mr-2" />{' '}
                        {safeT('common.manage') || 'Manage'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(h)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />{' '}
                        {safeT('common.edit')}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {safeT('common.delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {safeT('hotel_form.delete_title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {safeT('hotel_form.delete_desc')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {safeT('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(h.id)}
                            >
                              {safeT('common.delete')}
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
                    {safeT('common.empty')}
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
