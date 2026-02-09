import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import useShortTermStore from '@/stores/useShortTermStore'
import { useToast } from '@/hooks/use-toast'
import { Booking } from '@/lib/types'
import { CheckCircle, Clock, User, PenTool, Home } from 'lucide-react'
import { format } from 'date-fns'

export default function OnlineCheckIn() {
  const { bookingId } = useParams()
  const { bookings, performCheckIn } = useShortTermStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [arrivalTime, setArrivalTime] = useState('15:00')
  const [signature, setSignature] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const found = bookings.find((b) => b.id === bookingId)
    if (found) setBooking(found)
  }, [bookingId, bookings])

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Loading reservation details...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (booking.status === 'checked_in' || booking.status === 'checked_out') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Card className="w-full max-w-md bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="bg-green-100 p-3 rounded-full w-fit mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800">
              Check-in Completed
            </h2>
            <p className="text-green-700">
              Welcome, {booking.guestName}! You are already checked in.
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 w-full"
              onClick={() => navigate(`/guest/${booking.propertyId}`)}
            >
              Go to Room Concierge
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCheckIn = () => {
    if (!signature.trim() || !termsAccepted) {
      toast({
        title: 'Validation Error',
        description: 'Please sign and accept the terms to proceed.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      performCheckIn(booking.id, { signature, arrivalTime })
      setIsSubmitting(false)
      toast({
        title: 'Check-in Successful',
        description: 'Welcome! Your stay has officially started.',
      })
      navigate(`/guest/${booking.propertyId}`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-navy">Online Check-in</h1>
          <p className="text-muted-foreground">
            Prepare for your arrival at {booking.propertyName}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Reservation Details</CardTitle>
            <CardDescription>Please verify your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Guest
                </span>
                <p className="font-semibold">{booking.guestName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Home className="h-3 w-3" /> Property
                </span>
                <p className="font-semibold">{booking.propertyName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Check-in Date</span>
                <p className="font-semibold">
                  {format(new Date(booking.checkIn), 'PPP')}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Check-out Date</span>
                <p className="font-semibold">
                  {format(new Date(booking.checkOut), 'PPP')}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label htmlFor="arrival" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Estimated Arrival Time
              </Label>
              <Input
                id="arrival"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="signature" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" /> Digital Signature
              </Label>
              <Input
                id="signature"
                placeholder="Type your full name to sign"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="font-script text-lg italic"
              />
              <p className="text-xs text-muted-foreground">
                By typing your name, you agree to the property rules and terms
                of service.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-md border">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(c) => setTermsAccepted(c as boolean)}
              />
              <Label htmlFor="terms" className="text-sm font-normal">
                I accept the{' '}
                <span className="underline text-blue-600">
                  Terms & Conditions
                </span>{' '}
                and verify that my identity information is correct.
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-trust-blue h-12 text-lg"
              onClick={handleCheckIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Check-in'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
