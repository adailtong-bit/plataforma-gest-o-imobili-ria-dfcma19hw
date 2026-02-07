import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Plus,
  Building,
  Edit,
  Save,
  Trash2,
  Users,
  Layers,
} from 'lucide-react'
import useHotelStore from '@/stores/useHotelStore'
import useLanguageStore from '@/stores/useLanguageStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { Tower } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { DataMask } from '@/components/DataMask'
import { Badge } from '@/components/ui/badge'
import { RoomList } from '@/components/hotels/RoomList'
import { Textarea } from '@/components/ui/textarea'

export default function HotelDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hotels, towers, updateHotel, deleteHotel, addTower, deleteTower } =
    useHotelStore()
  const { properties } = usePropertyStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const hotel = hotels.find((h) => h.id === id)
  const hotelTowers = towers.filter((t) => t.hotelId === id)
  const hotelRooms = properties.filter((p) => p.hotelId === id)

  // Operational Stats
  const totalRooms = hotelRooms.length
  const occupiedRooms = hotelRooms.filter((r) => r.status === 'occupied').length
  const readyRooms = hotelRooms.filter((r) => r.status === 'available').length
  const maintenanceRooms = hotelRooms.filter(
    (r) => r.status === 'maintenance',
  ).length
  const cleaningRooms = hotelRooms.filter((r) => r.status === 'cleaning').length

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(hotel ? { ...hotel } : null)
  const [openTowerDialog, setOpenTowerDialog] = useState(false)
  const [newTower, setNewTower] = useState<Partial<Tower>>({
    name: '',
    description: '',
    floors: 1,
  })

  if (!hotel || !formData) return <div>Hotel not found</div>

  const hasTowers = hotelTowers.length > 0

  const handleSaveHotel = () => {
    if (formData) {
      updateHotel(formData)
      setIsEditing(false)
      toast({ title: t('common.success') })
    }
  }

  const handleDeleteHotel = () => {
    if (confirm(t('common.delete_title'))) {
      deleteHotel(hotel.id)
      navigate('/hotels')
      toast({ title: t('common.success') })
    }
  }

  const handleAddTower = () => {
    if (!newTower.name) return

    addTower({
      id: `tower-${Date.now()}`,
      hotelId: hotel.id,
      name: newTower.name,
      description: newTower.description,
      floors: newTower.floors || 1,
    })
    setOpenTowerDialog(false)
    setNewTower({ name: '', description: '', floors: 1 })
    toast({ title: t('common.success') })
  }

  const handleDeleteTower = (towerId: string) => {
    if (confirm(t('common.delete_title'))) {
      deleteTower(towerId)
      toast({ title: t('common.success') })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/hotels">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            <DataMask>{hotel.name}</DataMask>
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/hotels" className="hover:underline">
              {t('hotels.title')}
            </Link>
            <span>/</span>
            <span>{hotel.name}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {isEditing ? (
            <Button onClick={handleSaveHotel} className="bg-trust-blue gap-2">
              <Save className="h-4 w-4" /> {t('common.save')}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" /> {t('common.edit')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteHotel}
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Operational Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Rooms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-900">{totalRooms}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Ready / Available
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-900">
              {readyRooms}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-100">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">
              Occupied
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-yellow-900">
              {occupiedRooms}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Service / Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-900">
              {maintenanceRooms + cleaningRooms}
            </div>
            <p className="text-xs text-red-600 mt-1">
              {cleaningRooms} Cleaning / {maintenanceRooms} Maint.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{t('hotels.hotel_details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>{t('common.name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('common.description')}</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={!isEditing}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('common.address')}</Label>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{t('properties.city_placeholder')}</Label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>{t('properties.state_placeholder')}</Label>
                <Input
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="amenities">
                <AccordionTrigger>Amenities</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities?.map((am, i) => (
                      <Badge key={i} variant="outline">
                        {am}
                      </Badge>
                    ))}
                    {(!formData.amenities ||
                      formData.amenities.length === 0) && (
                      <span className="text-sm text-muted-foreground">
                        No amenities listed.
                      </span>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="policies">
                <AccordionTrigger>Policies</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    {formData.policies?.map((pol, i) => (
                      <li key={i}>{pol}</li>
                    ))}
                    {(!formData.policies || formData.policies.length === 0) && (
                      <span className="text-muted-foreground">
                        No policies listed.
                      </span>
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="contacts">
                <AccordionTrigger>Team Roles</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {formData.contacts?.map((contact, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 p-2 rounded text-sm border"
                      >
                        <div className="font-bold flex items-center gap-2">
                          <Users className="h-3 w-3" /> {contact.role}
                        </div>
                        <div>{contact.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {contact.phone} • {contact.email}
                        </div>
                      </div>
                    ))}
                    {(!formData.contacts || formData.contacts.length === 0) && (
                      <span className="text-muted-foreground">
                        No contacts listed.
                      </span>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Conditional View: Towers OR Rooms */}
        <Card className="md:col-span-2">
          {hasTowers ? (
            // TOWERS VIEW
            <>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('hotels.towers')}</CardTitle>
                  <CardDescription>
                    Manage towers within {hotel.name}. Select a tower to view
                    its rooms.
                  </CardDescription>
                </div>
                <Dialog
                  open={openTowerDialog}
                  onOpenChange={setOpenTowerDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-trust-blue gap-2" size="sm">
                      <Plus className="h-4 w-4" /> {t('hotels.add_tower')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('hotels.new_tower')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>{t('common.name')}</Label>
                        <Input
                          value={newTower.name}
                          onChange={(e) =>
                            setNewTower({ ...newTower, name: e.target.value })
                          }
                          placeholder="North Tower"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('common.description')}</Label>
                        <Input
                          value={newTower.description}
                          onChange={(e) =>
                            setNewTower({
                              ...newTower,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('hotels.floors')}</Label>
                        <Input
                          type="number"
                          value={newTower.floors}
                          onChange={(e) =>
                            setNewTower({
                              ...newTower,
                              floors: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddTower}>
                        {t('common.save')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {hotelTowers.map((tower) => (
                    <div
                      key={tower.id}
                      className="border rounded-lg p-4 flex flex-col gap-4 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Building className="h-6 w-6 text-blue-700" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{tower.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Layers className="h-3 w-3" />
                              {tower.floors} Floors •{' '}
                              {tower.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTower(tower.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex justify-end border-t pt-3">
                        <Button asChild>
                          <Link
                            to={`/hotels/${hotel.id}/towers/${tower.id}`}
                            className="w-full sm:w-auto"
                          >
                            Ver Detalhes (View Rooms)
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          ) : (
            // DIRECT ROOMS VIEW
            <>
              <CardHeader>
                <CardTitle>{t('hotels.rooms')}</CardTitle>
                <CardDescription>
                  Manage rooms for {hotel.name}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* No towerId passed implies direct hotel rooms context */}
                <RoomList hotelId={hotel.id} towerId="none" />
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
