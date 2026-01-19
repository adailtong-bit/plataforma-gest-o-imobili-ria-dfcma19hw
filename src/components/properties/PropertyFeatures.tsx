import { Property, Condominium } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Lock } from 'lucide-react'

interface PropertyFeaturesProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
  condominium?: Condominium
}

export function PropertyFeatures({
  data,
  onChange,
  canEdit,
  condominium,
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

        {/* Mirrored Condo Access */}
        {condominium && condominium.accessCredentials && (
          <div className="md:col-span-3 pt-4 border-t mt-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground mb-3">
              <Lock className="h-4 w-4" /> Acesso Condomínio (Mirror)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-lg">
              {Object.entries(condominium.accessCredentials).map(
                ([key, val]) =>
                  val && (
                    <div key={key}>
                      <Label className="text-xs text-muted-foreground uppercase">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <div className="font-mono text-sm font-semibold">
                        {val}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
