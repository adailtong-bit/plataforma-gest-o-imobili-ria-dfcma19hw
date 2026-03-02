import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

// Placeholder map component to satisfy imports without complex google maps logic
export function LocationMap({
  address,
  city,
  state,
  zipCode,
  country,
}: {
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}) {
  const fullAddress = [address, city, state, zipCode, country]
    .filter(Boolean)
    .join(', ')
  return (
    <Card className="h-full min-h-[300px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" /> Location Map
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] min-h-[250px] bg-slate-100 flex items-center justify-center rounded-md m-6 mt-0">
        <div className="text-center text-muted-foreground p-6">
          <MapPin className="h-10 w-10 mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-lg mb-2">Map View Unavailable</p>
          <p className="text-sm max-w-[250px] mx-auto italic">
            {fullAddress || 'No address provided'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
