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
import useLanguageStore from '@/stores/useLanguageStore'
import { Loader2 } from 'lucide-react'

export default function Pricing() {
  const { t } = useLanguageStore()
  const [hotels, setHotels] = useState<any[]>([])
  const [selectedHotel, setSelectedHotel] = useState<string>('')
  const [loading, setLoading] = useState(true)

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
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.pricing') || 'Pricing'}
        </h1>
        <p className="text-muted-foreground">
          {t('pricing.desc') ||
            'Manage room categories, base prices, and apply them across your properties.'}
        </p>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>
            {t('hotels.select_property') || 'Select Property'}
          </CardTitle>
          <CardDescription>
            {t('pricing.select_desc') ||
              'Choose a hotel to manage its room categories and rates.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading hotels...</span>
            </div>
          ) : hotels.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hotels found. Create a hotel first.
            </p>
          ) : (
            <div className="w-full max-w-sm space-y-2">
              <Label>Hotel / Property</Label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Select a hotel" />
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

      {selectedHotel && <RoomTypesManager hotelId={selectedHotel} />}
    </div>
  )
}
