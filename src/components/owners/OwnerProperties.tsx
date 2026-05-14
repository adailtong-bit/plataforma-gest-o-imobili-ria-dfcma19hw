import { useState, useEffect } from 'react'
import { Property, Condominium } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Building2, ArrowLeft, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PropertyOverview } from '@/components/properties/PropertyOverview'
import { PropertyMedia } from '@/components/properties/PropertyMedia'
import { PropertyContent } from '@/components/properties/PropertyContent'
import { PropertyLocation } from '@/components/properties/PropertyLocation'
import { ShortTermCalendar } from '@/components/short-term/ShortTermCalendar'
import { supabase } from '@/lib/supabase/client'

interface OwnerPropertiesProps {
  ownerId: string
  properties: Property[]
}

export function OwnerProperties({ ownerId, properties }: OwnerPropertiesProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  )
  const [condominiums, setCondominiums] = useState<Condominium[]>([])

  useEffect(() => {
    const fetchCondos = async () => {
      try {
        const { data } = await supabase
          .from('condominiums')
          .select('id, name')
          .catch(() => ({ data: [] }))
        if (data) {
          setCondominiums(data as Condominium[])
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchCondos()
  }, [])

  const ownerProperties = properties.filter((p) => p.ownerId === ownerId)
  const selectedProperty = ownerProperties.find(
    (p) => p.id === selectedPropertyId,
  )

  if (selectedProperty) {
    const condosToPass = [...condominiums]
    if (
      selectedProperty.condominiumId &&
      !condosToPass.some((c) => c.id === selectedProperty.condominiumId)
    ) {
      condosToPass.push({
        id: selectedProperty.condominiumId,
        name: 'Condomínio Vinculado',
      } as any)
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => setSelectedPropertyId(null)}
          className="mb-2 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Propriedades
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {selectedProperty.name}
            </h2>
            <div className="flex items-center text-slate-500 mt-1 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {selectedProperty.address}
              {selectedProperty.city ? `, ${selectedProperty.city}` : ''}
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-slate-50 text-sm px-3 py-1 font-medium"
          >
            {selectedProperty.status === 'available'
              ? 'Disponível'
              : selectedProperty.status === 'rented'
                ? 'Alugado'
                : selectedProperty.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PropertyMedia
              data={selectedProperty}
              onChange={() => {}}
              canEdit={false}
            />
            <PropertyOverview
              data={selectedProperty}
              onChange={() => {}}
              canEdit={false}
            />
            <PropertyLocation
              data={selectedProperty}
              onChange={() => {}}
              canEdit={false}
              condominiums={condosToPass}
            />
            <PropertyContent
              data={selectedProperty}
              onChange={() => {}}
              onNestedChange={() => {}}
              canEdit={false}
            />
          </div>
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white sticky top-6">
              <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  Calendário de Locações
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ShortTermCalendar propertyId={selectedProperty.id} />
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
                    <span className="text-slate-600">
                      Dias Ocupados / Reservados
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></div>
                    <span className="text-slate-600">Dias Disponíveis</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="border-b bg-slate-50/50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Building2 className="h-5 w-5 text-blue-600" /> Galeria de
          Propriedades
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {ownerProperties.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 border-2 border-dashed rounded-lg bg-slate-50/50">
            <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-900">
              Nenhuma propriedade associada
            </p>
            <p className="text-sm mt-1">
              Seus imóveis aparecerão aqui assim que a administradora os
              vincular ao seu perfil.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {ownerProperties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden border hover:shadow-lg transition-all duration-300 group bg-white border-slate-200 flex flex-col"
              >
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  {property.image ? (
                    <img
                      src={property.image}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={property.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                      <Building2 className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Badge className="absolute top-3 right-3 bg-white/95 text-slate-900 hover:bg-white border-none shadow-sm font-medium">
                    {property.status === 'available'
                      ? 'Disponível'
                      : property.status === 'rented'
                        ? 'Alugado'
                        : property.status}
                  </Badge>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3
                    className="font-bold text-lg text-slate-900 line-clamp-1 mb-2"
                    title={property.name}
                  >
                    {property.name}
                  </h3>
                  <div className="flex items-start gap-2 text-sm text-slate-500 mb-4 flex-1">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                    <span className="line-clamp-2 leading-relaxed">
                      {property.address}
                      {property.city ? `, ${property.city}` : ''}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <Button
                      variant="outline"
                      className="w-full gap-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 transition-colors"
                      onClick={() => setSelectedPropertyId(property.id)}
                    >
                      Ver Ficha Completa
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
