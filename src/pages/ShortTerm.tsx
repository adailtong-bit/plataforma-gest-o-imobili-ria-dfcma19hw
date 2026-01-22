import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Plus,
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  List,
} from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import useShortTermStore from '@/stores/useShortTermStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { ShortTermReports } from '@/components/short-term/ShortTermReports'
import { ShortTermCalendar } from '@/components/short-term/ShortTermCalendar'
import { CommunicationSettings } from '@/components/short-term/CommunicationSettings'
import { ShortTermBookings } from '@/components/short-term/ShortTermBookings'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Booking } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { CurrencyInput } from '@/components/ui/currency-input'

export default function ShortTerm() {
  const { t } = useLanguageStore()
  const { addBooking } = useShortTermStore()
  const { properties } = usePropertyStore()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    guestName: '',
    guestEmail: '',
    totalAmount: 0,
    paid: false,
    platform: 'direct',
    status: 'confirmed',
  })

  const shortTermProperties = properties.filter(
    (p) => p.profileType === 'short_term',
  )

  const handleSaveBooking = () => {
    if (
      !newBooking.propertyId ||
      !newBooking.guestName ||
      !newBooking.checkIn ||
      !newBooking.checkOut
    ) {
      toast({
        title: 'Error',
        description: 'Missing required fields.',
        variant: 'destructive',
      })
      return
    }

    addBooking({
      id: `bk-${Date.now()}`,
      propertyId: newBooking.propertyId,
      guestName: newBooking.guestName,
      guestEmail: newBooking.guestEmail || '',
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut,
      totalAmount: newBooking.totalAmount || 0,
      paid: newBooking.paid || false,
      platform: newBooking.platform || 'direct',
      status: newBooking.status || 'confirmed',
    } as Booking)

    setOpen(false)
    setNewBooking({
      guestName: '',
      guestEmail: '',
      totalAmount: 0,
      paid: false,
      platform: 'direct',
      status: 'confirmed',
    })
    toast({ title: 'Booking created successfully.' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('short_term.title')}
          </h1>
          <p className="text-muted-foreground">{t('short_term.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> {t('short_term.new_booking')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('short_term.new_booking')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('tenants.property')}</Label>
                  <Select
                    value={newBooking.propertyId}
                    onValueChange={(v) =>
                      setNewBooking({ ...newBooking, propertyId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {shortTermProperties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Booking Source</Label>
                  <Select
                    value={newBooking.platform}
                    onValueChange={(v: any) =>
                      setNewBooking({ ...newBooking, platform: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="airbnb">Airbnb</SelectItem>
                      <SelectItem value="vrbo">Vrbo</SelectItem>
                      <SelectItem value="booking.com">Booking.com</SelectItem>
                      <SelectItem value="direct">Direct / Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('short_term.guest')}</Label>
                  <Input
                    value={newBooking.guestName}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        guestName: e.target.value,
                      })
                    }
                    placeholder="Full Name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.email')}</Label>
                  <Input
                    value={newBooking.guestEmail}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        guestEmail: e.target.value,
                      })
                    }
                    placeholder="email@guest.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('short_term.check_in')}</Label>
                  <Input
                    type="date"
                    value={newBooking.checkIn}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, checkIn: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('short_term.check_out')}</Label>
                  <Input
                    type="date"
                    value={newBooking.checkOut}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, checkOut: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('short_term.total')} ($)</Label>
                  <CurrencyInput
                    value={newBooking.totalAmount}
                    onChange={(v) =>
                      setNewBooking({ ...newBooking, totalAmount: v })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.status')}</Label>
                  <Select
                    value={newBooking.status}
                    onValueChange={(v: any) =>
                      setNewBooking({ ...newBooking, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="checked_in">Checked In</SelectItem>
                      <SelectItem value="checked_out">Checked Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveBooking}>{t('common.save')}</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">
            <LayoutDashboard className="h-4 w-4 mr-2" /> Reports
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays className="h-4 w-4 mr-2" /> Calendar
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <List className="h-4 w-4 mr-2" /> Bookings
          </TabsTrigger>
          <TabsTrigger value="communication">
            <MessageSquare className="h-4 w-4 mr-2" /> Communication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <ShortTermReports />
        </TabsContent>

        <TabsContent value="calendar">
          <ShortTermCalendar />
        </TabsContent>

        <TabsContent value="bookings">
          <ShortTermBookings />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
