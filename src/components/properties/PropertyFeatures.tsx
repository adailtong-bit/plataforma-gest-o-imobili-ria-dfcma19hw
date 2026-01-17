import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface PropertyFeaturesProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
}

export function PropertyFeatures({
  data,
  onChange,
  canEdit,
}: PropertyFeaturesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Características e Acesso</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Quartos</Label>
          <Input
            type="number"
            value={data.bedrooms}
            onChange={(e) => onChange('bedrooms', Number(e.target.value))}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>Banheiros</Label>
          <Input
            type="number"
            value={data.bathrooms}
            onChange={(e) => onChange('bathrooms', Number(e.target.value))}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>Hóspedes (Max)</Label>
          <Input
            type="number"
            value={data.guests}
            onChange={(e) => onChange('guests', Number(e.target.value))}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2 md:col-span-3 pt-4">
          <h3 className="font-semibold text-sm">Wifi</h3>
        </div>
        <div className="grid gap-2">
          <Label>SSID (Rede)</Label>
          <Input
            value={data.wifiSsid || ''}
            onChange={(e) => onChange('wifiSsid', e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>Senha Wifi</Label>
          <Input
            value={data.wifiPassword || ''}
            onChange={(e) => onChange('wifiPassword', e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2 md:col-span-3 pt-4">
          <h3 className="font-semibold text-sm">Códigos de Acesso</h3>
        </div>
        <div className="grid gap-2">
          <Label>Porta Principal</Label>
          <Input
            value={data.accessCodeUnit || ''}
            onChange={(e) => onChange('accessCodeUnit', e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>Prédio/Portão</Label>
          <Input
            value={data.accessCodeBuilding || ''}
            onChange={(e) => onChange('accessCodeBuilding', e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>Serviço/Limpeza</Label>
          <Input
            value={data.accessCodeCleaning || ''}
            onChange={(e) => onChange('accessCodeCleaning', e.target.value)}
            disabled={!canEdit}
          />
        </div>
      </CardContent>
    </Card>
  )
}
