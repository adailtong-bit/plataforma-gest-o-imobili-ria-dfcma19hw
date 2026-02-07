import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Wifi, MapPin, Coffee, MessageSquare, CheckCircle } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import useTaskStore from '@/stores/useTaskStore'
import { useToast } from '@/hooks/use-toast'
import { Property } from '@/lib/types'

export default function RoomConcierge() {
  const { roomId } = useParams()
  const { properties } = usePropertyStore()
  const { addTask } = useTaskStore()
  const { toast } = useToast()

  const [property, setProperty] = useState<Property | null>(null)
  const [requestText, setRequestText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch from API based on roomId
    // Here we use the store
    const found = properties.find((p) => p.id === roomId)
    if (found) setProperty(found)
  }, [roomId, properties])

  const handleSubmitRequest = () => {
    if (!requestText.trim() || !property) return

    addTask({
      id: `req-${Date.now()}`,
      title: 'Guest Service Request',
      propertyId: property.id,
      propertyName: property.name,
      status: 'pending',
      type: 'guest_request',
      assignee: 'Concierge',
      priority: 'medium',
      description: requestText,
      date: new Date().toISOString(),
      source: 'guest',
    })

    setSubmitted(true)
    setRequestText('')
    toast({
      title: 'Request Sent',
      description: 'Our team will attend to you shortly.',
    })
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Room Info...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-navy">
            Welcome to {property.community || 'Our Hotel'}
          </h1>
          <p className="text-muted-foreground">
            Room {property.roomNumber} - Digital Concierge
          </p>
        </div>

        {/* Wifi Card */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Wifi className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Wi-Fi Access</CardTitle>
              <CardDescription>Connect to our network</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 p-3 rounded-md space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-sm">Network:</span>
                <span className="text-sm font-mono">
                  {property.wifiSsid || 'Hotel_Guest'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-sm">Password:</span>
                <span className="text-sm font-mono">
                  {property.wifiPassword || 'welcome123'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Local Guide */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-4">
            <div className="p-2 bg-green-100 rounded-full">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Local Guide</CardTitle>
              <CardDescription>Explore the area</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button
              variant="outline"
              className="justify-start gap-2 h-auto py-3"
            >
              <Coffee className="h-4 w-4" /> Best Coffee Nearby
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 h-auto py-3"
            >
              <MapPin className="h-4 w-4" /> Top Attractions
            </Button>
          </CardContent>
        </Card>

        {/* Service Request */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Service Request</CardTitle>
              <CardDescription>How can we help you?</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
                <h3 className="font-bold text-green-800">Request Received!</h3>
                <p className="text-sm text-green-700">
                  We are processing your request.
                </p>
                <Button
                  variant="link"
                  onClick={() => setSubmitted(false)}
                  className="text-green-800"
                >
                  New Request
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Need extra towels, room cleaning, or maintenance?"
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleSubmitRequest}
                  className="w-full bg-trust-blue"
                >
                  Submit Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
