import { Property, Condominium } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddressInput, AddressData } from '@/components/ui/address-input'
import { MapPin } from 'lucide-react'

interface PropertyLocationProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
  condominiums: Condominium[]
}

export function PropertyLocation({
  data,
  onChange,
  canEdit,
  condominiums,
}: PropertyLocationProps) {
  const handleAddressSelect = (addr: AddressData) => {
    onChange('address', addr.street)
    onChange('city', addr.city)
    onChange('state', addr.state)
    onChange('zipCode', addr.zipCode)
    onChange('neighborhood', addr.neighborhood)
    onChange('community', addr.community || data.community)
    onChange('country', addr.country)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Buscar Endereço (Auto)</Label>
            <AddressInput
              onAddressSelect={handleAddressSelect}
              defaultValue={data.address}
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label>
              Endereço <span className="text-red-500">*</span>
            </Label>
            <Input
              value={data.address}
              onChange={(e) => onChange('address', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Bairro</Label>
              <Input
                value={data.neighborhood || ''}
                onChange={(e) => onChange('neighborhood', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                CEP / Zip Code <span className="text-red-500">*</span>
              </Label>
              <Input
                value={data.zipCode || ''}
                onChange={(e) => onChange('zipCode', e.target.value)}
                disabled={!canEdit}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Cidade</Label>
              <Input
                value={data.city || ''}
                onChange={(e) => onChange('city', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Input
                value={data.state || ''}
                onChange={(e) => onChange('state', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>País</Label>
            <Input
              value={data.country || ''}
              onChange={(e) => onChange('country', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label>Comunidade</Label>
            <Input
              value={data.community}
              onChange={(e) => onChange('community', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label>Condomínio Vinculado</Label>
            <Select
              value={data.condominiumId || 'none'}
              onValueChange={(v) =>
                onChange('condominiumId', v === 'none' ? undefined : v)
              }
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {condominiums.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mapa de Propriedades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-square bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden border">
            <div className="absolute inset-0 bg-blue-50/50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <MapPin className="h-10 w-10 text-red-600 animate-bounce" />
            </div>
            {/* Mock markers for other properties */}
            <MapPin className="absolute top-1/4 left-1/4 h-6 w-6 text-blue-400 opacity-60" />
            <MapPin className="absolute bottom-1/3 right-1/4 h-6 w-6 text-blue-400 opacity-60" />
            <MapPin className="absolute top-1/3 right-1/3 h-6 w-6 text-blue-400 opacity-60" />

            <div className="z-10 bg-white/80 p-4 rounded-md shadow-sm backdrop-blur-sm text-center">
              <p className="font-semibold text-sm">Visualização de Mapa Mock</p>
              <p className="text-xs text-muted-foreground">
                Exibindo: {data.address}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                +3 outras propriedades do proprietário próximas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
