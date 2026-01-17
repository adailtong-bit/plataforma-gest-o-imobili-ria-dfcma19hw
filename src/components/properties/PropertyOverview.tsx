import { Property } from '@/lib/types'
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

interface PropertyOverviewProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
}

export function PropertyOverview({
  data,
  onChange,
  canEdit,
}: PropertyOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visão Geral</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Nome da Propriedade</Label>
          <Input
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>Perfil da Propriedade</Label>
          <Select
            value={data.profileType}
            onValueChange={(v) => onChange('profileType', v)}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short_term">Curta Duração (STR)</SelectItem>
              <SelectItem value="long_term">Longa Duração (LTR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Tipo de Imóvel</Label>
          <Select
            value={data.type}
            onValueChange={(v) => onChange('type', v)}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="House">Casa</SelectItem>
              <SelectItem value="Condo">Apartamento</SelectItem>
              <SelectItem value="Townhouse">Townhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            value={data.status}
            onValueChange={(v) => onChange('status', v)}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="occupied">Ocupado</SelectItem>
              <SelectItem value="vacant">Vago</SelectItem>
              <SelectItem value="maintenance">Em Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Status Marketing</Label>
          <Select
            value={data.marketingStatus || 'unlisted'}
            onValueChange={(v) => onChange('marketingStatus', v)}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="listed">Listado</SelectItem>
              <SelectItem value="unlisted">Não Listado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 col-span-1 md:col-span-2">
          <Label>URL da Imagem Principal</Label>
          <Input
            value={data.image}
            onChange={(e) => onChange('image', e.target.value)}
            disabled={!canEdit}
          />
        </div>
      </CardContent>
    </Card>
  )
}
