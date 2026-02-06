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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { ArrowLeft, Plus, Building, Edit, Save, Trash2 } from 'lucide-react'
import useHotelStore from '@/stores/useHotelStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tower } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { DataMask } from '@/components/DataMask'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function HotelDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hotels, towers, updateHotel, deleteHotel, addTower, deleteTower } =
    useHotelStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const hotel = hotels.find((h) => h.id === id)
  const hotelTowers = towers.filter((t) => t.hotelId === id)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(hotel ? { ...hotel } : null)
  const [openTowerDialog, setOpenTowerDialog] = useState(false)
  const [newTower, setNewTower] = useState<Partial<Tower>>({
    name: '',
    description: '',
    floors: 1,
  })

  if (!hotel || !formData) return <div>Hotel not found</div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
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
              <Label>{t('common.address')}</Label>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.city_placeholder')}</Label>
              <Input
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('hotels.manager')}</Label>
              <Input
                value={formData.managerName || ''}
                onChange={(e) =>
                  setFormData({ ...formData, managerName: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('hotels.towers')}</CardTitle>
              <CardDescription>
                Manage towers within this hotel.
              </CardDescription>
            </div>
            <Dialog open={openTowerDialog} onOpenChange={setOpenTowerDialog}>
              <DialogTrigger asChild>
                <Button className="bg-trust-blue gap-2">
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
                  <Button onClick={handleAddTower}>{t('common.save')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('common.description')}</TableHead>
                  <TableHead>{t('hotels.floors')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotelTowers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('hotels.no_towers')}
                    </TableCell>
                  </TableRow>
                ) : (
                  hotelTowers.map((tower) => (
                    <TableRow key={tower.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-500" />
                        <Link
                          to={`/hotels/${hotel.id}/towers/${tower.id}`}
                          className="hover:underline text-blue-700"
                        >
                          <DataMask>{tower.name}</DataMask>
                        </Link>
                      </TableCell>
                      <TableCell>{tower.description || '-'}</TableCell>
                      <TableCell>{tower.floors}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTower(tower.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
