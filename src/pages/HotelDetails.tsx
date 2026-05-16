import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Save,
  X,
  Plus,
  Building,
  MapPin,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AppContext } from '@/stores/AppContext'
import useLanguageStore from '@/stores/useLanguageStore'
import { Hotel, Tower } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoomList } from '@/components/hotels/RoomList'
import { RoomTypesManager } from '@/components/hotels/RoomTypesManager'
import { DataMask } from '@/components/DataMask'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

export default function HotelDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    hotels,
    towers,
    updateHotel,
    deleteHotel,
    addTower,
    updateTower,
    deleteTower,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Hotel | null>(null)
  const [newTowerName, setNewTowerName] = useState('')
  const [isAddTowerOpen, setIsAddTowerOpen] = useState(false)

  useEffect(() => {
    const found = hotels.find((h) => h.id === id)
    if (found) {
      setHotel(found)
      setFormData(found)
    }
  }, [id, hotels])

  if (!hotel || !formData) {
    return (
      <div className="p-6 text-center max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {t('hotels.not_found') || 'Hotel Not Found'}
        </h2>
        <Button
          onClick={() => navigate('/hotels')}
          className="bg-trust-blue text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back') || 'Back'}
        </Button>
      </div>
    )
  }

  const handleSave = () => {
    updateHotel(formData)
    setHotel(formData)
    setIsEditing(false)
    toast({
      title: t('common.success') || 'Success',
      description: t('hotels.update_success') || 'Hotel updated successfully.',
    })
  }

  const handleDelete = () => {
    deleteHotel(hotel.id)
    toast({
      title: t('common.success') || 'Success',
      description: t('hotels.delete_success') || 'Hotel deleted.',
    })
    navigate('/hotels')
  }

  const handleAddTower = () => {
    if (!newTowerName) return
    addTower({
      id: `tower-${Date.now()}`,
      hotelId: hotel.id,
      name: newTowerName,
    })
    setNewTowerName('')
    setIsAddTowerOpen(false)
    toast({
      title: t('common.success') || 'Success',
      description: t('hotels.tower_add_success') || 'Tower added successfully.',
    })
  }

  const hotelTowers = towers.filter((t) => t.hotelId === hotel.id)

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/hotels')}
            className="border-slate-300"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Building className="h-6 w-6 text-trust-blue" />
              <DataMask>{formData.name}</DataMask>
            </h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              <DataMask>
                {formData.address}, {formData.city}
              </DataMask>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData(hotel)
                  setIsEditing(false)
                }}
              >
                <X className="h-4 w-4 mr-2" /> {t('common.cancel') || 'Cancel'}
              </Button>
              <Button onClick={handleSave} className="bg-trust-blue text-white">
                <Save className="h-4 w-4 mr-2" /> {t('common.save') || 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" /> {t('common.edit') || 'Edit'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />{' '}
                    {t('common.delete') || 'Delete'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('common.delete_title') || 'Are you sure?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('common.delete_desc') ||
                        'This action cannot be undone.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t('common.cancel') || 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600"
                    >
                      {t('common.delete') || 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            {t('properties.tabs.overview') || 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="towers">
            {t('hotels.towers') || 'Towers'}
          </TabsTrigger>
          <TabsTrigger value="room-types">
            {t('hotels.room_types') || 'Room Types & Rates'}
          </TabsTrigger>
          <TabsTrigger value="rooms">
            {t('hotels.all_rooms') || 'All Rooms'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('hotels.info') || 'Hotel Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('common.name') || 'Name'}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('condominiums.manager_name') || 'Manager Name'}
                  </Label>
                  <Input
                    value={formData.managerName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, managerName: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('condominiums.manager_email') || 'Manager Email'}
                  </Label>
                  <Input
                    value={formData.managerEmail || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, managerEmail: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('condominiums.manager_phone') || 'Manager Phone'}
                  </Label>
                  <Input
                    value={formData.managerPhone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, managerPhone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{t('common.address') || 'Address'}</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.city') || 'City'}</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.state') || 'State'}</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="towers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">
              {t('hotels.towers_wings') || 'Towers & Wings'}
            </h3>
            <Dialog open={isAddTowerOpen} onOpenChange={setIsAddTowerOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-trust-blue text-white">
                  <Plus className="w-4 h-4 mr-2" />{' '}
                  {t('hotels.add_tower') || 'Add Tower'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t('hotels.add_new_tower') || 'Add New Tower/Wing'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t('hotels.tower_name') || 'Tower Name'}</Label>
                    <Input
                      value={newTowerName}
                      onChange={(e) => setNewTowerName(e.target.value)}
                      placeholder="e.g. North Tower"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddTowerOpen(false)}
                  >
                    {t('common.cancel') || 'Cancel'}
                  </Button>
                  <Button onClick={handleAddTower}>
                    {t('common.add') || 'Add'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotelTowers.map((tower) => (
              <Card key={tower.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{tower.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-4">
                    <Link to={`/hotels/${hotel.id}/towers/${tower.id}`}>
                      <Button variant="outline" size="sm">
                        {t('hotels.manage_rooms') || 'Manage Rooms'}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => deleteTower(tower.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {hotelTowers.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                {t('hotels.no_towers') || 'No towers or wings defined.'}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="room-types">
          <RoomTypesManager hotelId={hotel.id} />
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>{t('hotels.all_rooms') || 'All Rooms'}</CardTitle>
              <CardDescription>
                Rooms across all towers in this hotel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoomList hotelId={hotel.id} towerId="none" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
