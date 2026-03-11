import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function HotelRoomDetails() {
  const { hotelId, roomId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (roomId) {
      // Redirect to standard property details since rooms are treated as short term properties
      navigate(`/properties/${roomId}`)
    } else {
      navigate(`/hotels/${hotelId}`)
    }
  }, [roomId, hotelId, navigate])

  return (
    <div className="p-6 flex justify-center">
      <p className="text-muted-foreground">Redirecting to room details...</p>
    </div>
  )
}
