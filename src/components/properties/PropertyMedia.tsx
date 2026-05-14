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
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>{t('properties.cover_image') || 'Cover Image'}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.image ? (
          <img
            src={data.image}
            alt={data.name}
            className="w-full max-w-md rounded-lg shadow-sm"
            crossOrigin="anonymous"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg'
            }}
          />
        ) : (
          <div className="p-8 text-center text-muted-foreground border-dashed border-2 rounded-lg">
            {t('properties.no_image') || 'No Image'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
