import { MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useLanguageStore from '@/stores/useLanguageStore'

interface LocationMapProps {
  address: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  className?: string
}

export function LocationMap({
  address,
  city,
  state,
  zipCode,
  country,
  className,
}: LocationMapProps) {
  const { t } = useLanguageStore()

  // Construct a full address string for the map query
  const fullAddress = [address, city, state, zipCode, country]
    .filter(Boolean)
    .join(', ')

  const encodedAddress = encodeURIComponent(fullAddress)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('properties.location.map_title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden border">
          {address && city ? (
            <iframe
              title="Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <MapPin className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {t('properties.location.map_hint')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
