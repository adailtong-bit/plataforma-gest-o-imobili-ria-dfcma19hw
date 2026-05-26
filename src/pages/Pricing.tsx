import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RoomTypesManager } from '@/components/hotels/RoomTypesManager'
import { BulkPricingModal } from '@/components/hotels/BulkPricingModal'
import { Button } from '@/components/ui/button'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { Loader2, Settings } from 'lucide-react'

export default function Pricing() {
  const { t } = useDbTranslations()
  const [hotels, setHotels] = useState<any[]>([])
  const [selectedHotel, setSelectedHotel] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('hotels')
        .select('id, name')
        .order('name')
      if (data && data.length > 0) {
        setHotels(data)
        setSelectedHotel(data[0].id)
      }
      setLoading(false)
    }
    fetchHotels()

    const handleUpdate = () => setRefreshKey((prev) => prev + 1)
    window.addEventListener('roomTypesUpdated', handleUpdate)
    return () => window.removeEventListener('roomTypesUpdated', handleUpdate)
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('menu.system.pricing', 'Pricing')}
          </h1>
          <p className="text-muted-foreground">
            {t('pricing.desc') ||
              'Manage room categories, base prices, and apply them across your properties.'}
          </p>
        </div>
        {selectedHotel && (
          <Button
            onClick={() => setIsBulkOpen(true)}
            className="bg-trust-blue text-white gap-2"
          >
            <Settings className="h-4 w-4" />{' '}
            {t('pricing.bulk_pricing', 'Bulk Pricing Engine')}
          </Button>
        )}
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>
            {t('hotels.select_property', 'Select Property')}
          </CardTitle>
          <CardDescription>
            {t(
              'pricing.select_desc',
              'Choose a hotel to manage its room categories and rates.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('pricing.loading_hotels', 'Loading hotels...')}</span>
            </div>
          ) : hotels.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('pricing.no_hotels', 'No hotels found. Create a hotel first.')}
            </p>
          ) : (
            <div className="w-full max-w-sm space-y-2">
              <Label>{t('pricing.hotel_property', 'Hotel / Property')}</Label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger className="bg-slate-50">
                  <SelectValue
                    placeholder={t('pricing.select_hotel', 'Select a hotel')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id} className="font-medium">
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedHotel && (
        <RoomTypesManager key={refreshKey} hotelId={selectedHotel} />
      )}

      {selectedHotel && (
        <BulkPricingModal
          hotelId={selectedHotel}
          open={isBulkOpen}
          onOpenChange={setIsBulkOpen}
        />
      )}
    </div>
  )
}
