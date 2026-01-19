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
    <Card>
      <CardHeader>
        <CardTitle>Localização</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2 col-span-1 md:col-span-2">
          <Label>Buscar Endereço (Auto)</Label>
          <AddressInput
            onAddressSelect={handleAddressSelect}
            defaultValue={data.address}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>Endereço</Label>
          <Input
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>Bairro</Label>
          <Input
            value={data.neighborhood || ''}
            onChange={(e) => onChange('neighborhood', e.target.value)}
            disabled={!canEdit}
          />
        </div>
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
        <div className="grid gap-2">
          <Label>CEP / Zip Code</Label>
          <Input
            value={data.zipCode || ''}
            onChange={(e) => onChange('zipCode', e.target.value)}
            disabled={!canEdit}
          />
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
        <div className="grid gap-2 col-span-1 md:col-span-2">
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
  )
}
