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
import { Textarea } from '@/components/ui/textarea'
import {
  Wifi,
  MapPin,
  Coffee,
  MessageSquare,
  CheckCircle,
  Star,
} from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import useTaskStore from '@/stores/useTaskStore'
import useShortTermStore from '@/stores/useShortTermStore'
import { useToast } from '@/hooks/use-toast'
import { Property, Feedback } from '@/lib/types'

export default function RoomConcierge() {
  const { roomId } = useParams()
  const { properties } = usePropertyStore()
  const { addTask } = useTaskStore()
  const { addFeedback } = useShortTermStore()
  const { toast } = useToast()

  const [property, setProperty] = useState<Property | null>(null)
  const [requestText, setRequestText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Rating State
  const [rating, setRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  useEffect(() => {
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

  const handleSubmitFeedback = () => {
    if (!property) return

    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      bookingId: `bk-guest-${Date.now()}`,
      propertyId: property.id,
      guestName: 'Guest (Concierge)',
      rating,
      comment: feedbackComment,
      date: new Date().toISOString(),
      status: 'new',
    }

    addFeedback(newFeedback)
    setFeedbackSubmitted(true)
    toast({ title: 'Thank You!', description: 'We appreciate your feedback.' })
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
            Welcome to {property.community || 'Grand Heritage Hotel'}
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

        {/* Rate Your Stay */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-4">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Rate Your Stay</CardTitle>
              <CardDescription>We value your feedback</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {feedbackSubmitted ? (
              <div className="text-center p-4 bg-green-50 text-green-700 rounded-lg">
                Thank you for your feedback!
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${
                        rating >= star ? 'text-yellow-500' : 'text-slate-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Leave a comment..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
                <Button
                  onClick={handleSubmitFeedback}
                  className="w-full bg-trust-blue"
                  disabled={rating === 0}
                >
                  Submit Review
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
