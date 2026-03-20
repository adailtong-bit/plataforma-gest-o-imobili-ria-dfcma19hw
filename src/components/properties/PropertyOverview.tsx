import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  data: Property
  onChange: (f: keyof Property, v: any) => void
  canEdit: boolean
}

export function PropertyOverview({ data, onChange, canEdit }: Props) {
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome da Propriedade</Label>
            <Input
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de Propriedade</Label>
            <Input
              value={data.type}
              onChange={(e) => onChange('type', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de Perfil</Label>
            <Input value={data.profileType} disabled />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Input value={data.status} disabled />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
