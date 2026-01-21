import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { MapPin, ExternalLink, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface OwnerPropertiesProps {
  ownerId: string
  properties: Property[]
}

export function OwnerProperties({ ownerId, properties }: OwnerPropertiesProps) {
  const ownerProperties = properties.filter((p) => p.ownerId === ownerId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Propriedades do Proprietário
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ownerProperties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhuma propriedade associada a este proprietário.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownerProperties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden border hover:shadow-md transition-shadow group"
              >
                <div className="h-40 bg-muted relative">
                  {property.image ? (
                    <img
                      src={property.image}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      alt={property.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <Building2 className="h-10 w-10" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-white/90 text-black hover:bg-white">
                    {property.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3
                    className="font-semibold text-lg truncate"
                    title={property.name}
                  >
                    {property.name}
                  </h3>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2 min-h-[40px]">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{property.address}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 hover:bg-slate-50"
                      asChild
                    >
                      <Link to={`/properties/${property.id}`}>
                        <ExternalLink className="h-4 w-4" /> Ver Detalhes
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
