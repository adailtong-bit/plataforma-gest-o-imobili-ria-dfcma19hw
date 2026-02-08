import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, ShoppingCart, BarChart2 } from 'lucide-react'
import useManagementStore from '@/stores/useManagementStore'
import useShortTermStore from '@/stores/useShortTermStore'
import { useToast } from '@/hooks/use-toast'
import { GuestService } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServiceProfitabilityReport } from '@/components/financial/ServiceProfitabilityReport'

export default function GuestServices() {
  const {
    guestServices,
    addGuestService,
    updateGuestService,
    deleteGuestService,
    addServiceOrder,
  } = useManagementStore()
  const { bookings } = useShortTermStore()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentService, setCurrentService] = useState<Partial<GuestService>>({
    name: '',
    description: '',
    price: 0,
    category: 'other',
    active: true,
  })

  const [selectedBooking, setSelectedBooking] = useState('')
  const [serviceToAssign, setServiceToAssign] = useState<string>('')

  const activeBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'checked_in',
  )

  const handleSave = () => {
    if (!currentService.name || !currentService.price) return

    if (isEditing && currentService.id) {
      updateGuestService(currentService as GuestService)
      toast({ title: 'Service Updated' })
    } else {
      addGuestService({
        ...currentService,
        id: `svc-${Date.now()}`,
        active: true,
      } as GuestService)
      toast({ title: 'Service Created' })
    }
    setOpen(false)
    setIsEditing(false)
    setCurrentService({
      name: '',
      description: '',
      price: 0,
      category: 'other',
      active: true,
    })
  }

  const handleEdit = (service: GuestService) => {
    setCurrentService(service)
    setIsEditing(true)
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this service?')) {
      deleteGuestService(id)
      toast({ title: 'Service Deleted' })
    }
  }

  const handleAssign = () => {
    if (!selectedBooking || !serviceToAssign) return
    const service = guestServices.find((s) => s.id === serviceToAssign)

    if (service) {
      addServiceOrder({
        id: `ord-${Date.now()}`,
        bookingId: selectedBooking,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        date: new Date().toISOString(),
        status: 'pending',
      })
      toast({
        title: 'Service Assigned',
        description: `Added ${service.name} to booking.`,
      })
      setAssignOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Guest Services
          </h1>
          <p className="text-muted-foreground">
            Manage additional services and amenities catalog.
          </p>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
          <TabsTrigger value="financials">
            <BarChart2 className="h-4 w-4 mr-2" /> Financial Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <div className="flex justify-end gap-2 mb-4">
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ShoppingCart className="h-4 w-4" /> Assign Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Service to Guest</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Select Booking</Label>
                    <Select
                      value={selectedBooking}
                      onValueChange={setSelectedBooking}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Guest/Room" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeBookings.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.guestName} ({b.propertyName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Select Service</Label>
                    <Select
                      value={serviceToAssign}
                      onValueChange={setServiceToAssign}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                      <SelectContent>
                        {guestServices
                          .filter((s) => s.active)
                          .map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} - ${s.price}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAssign} className="bg-trust-blue">
                    Confirm Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-trust-blue gap-2">
                  <Plus className="h-4 w-4" /> Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isEditing ? 'Edit Service' : 'New Service'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input
                      value={currentService.name}
                      onChange={(e) =>
                        setCurrentService({
                          ...currentService,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input
                      value={currentService.description}
                      onChange={(e) =>
                        setCurrentService({
                          ...currentService,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        value={currentService.price}
                        onChange={(e) =>
                          setCurrentService({
                            ...currentService,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Category</Label>
                      <Select
                        value={currentService.category}
                        onValueChange={(v: any) =>
                          setCurrentService({ ...currentService, category: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spa">Spa</SelectItem>
                          <SelectItem value="transport">Transport</SelectItem>
                          <SelectItem value="dining">Dining</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSave} className="bg-trust-blue">
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guestServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div>{service.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.description}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {service.category}
                      </TableCell>
                      <TableCell>{formatCurrency(service.price)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={service.active ? 'default' : 'secondary'}
                        >
                          {service.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDelete(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials">
          <ServiceProfitabilityReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
