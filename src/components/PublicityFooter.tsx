import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import usePublicityStore from '@/stores/usePublicityStore'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { useAdRotation } from '@/hooks/useAdRotation'
import { cn } from '@/lib/utils'

export function PublicityFooter() {
  const { advertisements } = usePublicityStore()

  const activeAds = useMemo(
    () => advertisements.filter((ad) => ad.active && ad.placement === 'footer'),
    [advertisements],
  )

  const visibleAds = useAdRotation(activeAds, 3, 12)

  if (visibleAds.length === 0) return null

  return (
    <div className="mt-8 mb-4 border-t pt-6 shrink-0">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-1">
        Sponsored
      </h3>
      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          visibleAds.length === 1
            ? 'md:grid-cols-1'
            : visibleAds.length === 2
              ? 'md:grid-cols-2'
              : 'md:grid-cols-3',
        )}
      >
        {visibleAds.map((ad, idx) => (
          <Card
            key={`${ad.id}-${idx}`}
            className="overflow-hidden hover:shadow-md transition-all group animate-in fade-in duration-500"
          >
            <div className="flex h-24">
              <div className="w-1/3 relative bg-muted">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg'
                    e.currentTarget.onerror = null
                  }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <CardContent className="w-2/3 p-3 flex flex-col justify-center">
                <h4 className="font-semibold text-sm line-clamp-1">
                  {ad.title}
                </h4>
                {ad.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-2">
                    {ad.description}
                  </p>
                )}
                {ad.linkUrl && (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs text-blue-600 self-start flex items-center gap-1"
                    asChild
                  >
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn More <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
