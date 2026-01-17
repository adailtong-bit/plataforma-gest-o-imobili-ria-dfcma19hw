import { Property, Owner, Partner } from '@/lib/types'
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

interface PropertyFinancialsProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
  owners: Owner[]
  partners: Partner[]
}

export function PropertyFinancials({
  data,
  onChange,
  canEdit,
  owners,
  partners,
}: PropertyFinancialsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financeiro e Gestão</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Proprietário</Label>
          <Select
            value={data.ownerId}
            onValueChange={(v) => onChange('ownerId', v)}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {owners.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Agente Responsável</Label>
          <Select
            value={data.agentId || 'none'}
            onValueChange={(v) =>
              onChange('agentId', v === 'none' ? undefined : v)
            }
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {partners
                .filter((p) => p.type === 'agent')
                .map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 md:col-span-2 pt-4">
          <h3 className="font-semibold text-sm">Associação (HOA)</h3>
        </div>
        <div className="grid gap-2">
          <Label>Valor HOA ($)</Label>
          <Input
            type="number"
            value={data.hoaValue || 0}
            onChange={(e) => onChange('hoaValue', Number(e.target.value))}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>Frequência HOA</Label>
          <Select
            value={data.hoaFrequency || 'monthly'}
            onValueChange={(v) => onChange('hoaFrequency', v)}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="semi-annually">Semestral</SelectItem>
              <SelectItem value="annually">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
