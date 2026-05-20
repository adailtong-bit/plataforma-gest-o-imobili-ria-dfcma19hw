import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAdRotation } from '@/hooks/useAdRotation'
import { Card } from '@/components/ui/card'

import { Advertisement } from '@/hooks/useAdRotation'

export function AdDisplay({ locationKey }: { locationKey: string }) {
  const [ads, setAds] = useState<Advertisement[]>([])

  useEffect(() => {
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from('publicity_campaigns')
        .select(`*, publicity_pricing_matrix!inner(*)`)
        .eq('status', 'active')
        .eq('publicity_pricing_matrix.location_key', locationKey)

      if (data && !error) {
        const formattedAds: Advertisement[] = data.map((d: any) => ({
          id: d.id,
          imageUrl: d.image_url || undefined,
          linkUrl: d.link_url || undefined,
          title: d.title,
        }))
        setAds(formattedAds)
      }
    }
    void fetchAds()
  }, [locationKey])

  // Show up to 1 ad at a time, rotate every 5 seconds dynamically
  const visibleAds = useAdRotation(ads, 1, 5)

  if (visibleAds.length === 0) return null

  return (
    <div className="w-full flex justify-center py-4 px-4">
      {visibleAds.map((ad) => (
        <a
          key={ad.id}
          href={ad.link_url || '#'}
          target="_blank"
          rel="noreferrer"
          className="block w-full max-w-4xl"
        >
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 animate-fade-in">
            {ad.image_url ? (
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-32 md:h-48 object-cover"
              />
            ) : (
              <div className="w-full h-32 md:h-48 bg-slate-100 flex items-center justify-center text-slate-500">
                <span className="font-semibold text-lg">{ad.title}</span>
              </div>
            )}
          </Card>
        </a>
      ))}
    </div>
  )
}
