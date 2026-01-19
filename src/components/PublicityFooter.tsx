import { Card, CardContent } from '@/components/ui/card'
import usePublicityStore from '@/stores/usePublicityStore'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export function PublicityFooter() {
  const { advertisements } = usePublicityStore()

  // Filter active ads and those meant for footer
  const activeAds = advertisements.filter(
    (ad) => ad.active && (!ad.placement || ad.placement === 'footer'),
  )

  if (activeAds.length === 0) return null

  return (
    <div className="mt-8 mb-4 border-t pt-6">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-1">
        Publicidade & Parceiros
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeAds.map((ad) => (
          <Card
            key={ad.id}
            className="overflow-hidden hover:shadow-md transition-all group"
          >
            <div className="flex h-24">
              <div className="w-1/3 relative bg-muted">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
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
                    className="h-auto p-0 text-xs text-trust-blue self-start flex items-center gap-1"
                    asChild
                  >
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Saiba Mais <ExternalLink className="h-3 w-3" />
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
