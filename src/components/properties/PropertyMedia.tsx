import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useLanguageStore from '@/stores/useLanguageStore'

interface Props {
  data: Property
  onChange: (f: keyof Property, v: any) => void
  canEdit: boolean
}

export function PropertyMedia({ data }: Props) {
  const { t } = useLanguageStore()

  // Convert single image to array for gallery layout
  const images = data.image ? [data.image] : []

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>
          {t('properties.media_gallery', 'Media & Gallery')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${data.name} - Image ${idx + 1}`}
                className="w-full h-64 object-cover rounded-lg shadow-sm"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg'
                }}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground border-dashed border-2 rounded-lg">
            {t('properties.no_image', 'No Image Available')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
