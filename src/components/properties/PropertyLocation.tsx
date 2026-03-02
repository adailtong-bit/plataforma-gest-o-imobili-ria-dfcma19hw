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

interface Props {
  data: Property
  onChange: (f: keyof Property, v: any) => void
  canEdit: boolean
  condominiums: Condominium[]
}

export function PropertyLocation({
  data,
  onChange,
  canEdit,
  condominiums,
}: Props) {
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>Location Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={data.address}
              onChange={(e) => onChange('address', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={data.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input
              value={data.state || ''}
              onChange={(e) => onChange('state', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>Zip Code</Label>
            <Input
              value={data.zipCode || ''}
              onChange={(e) => onChange('zipCode', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Linked Condominium</Label>
            <Select
              value={data.condominiumId || 'none'}
              onValueChange={(v) =>
                onChange('condominiumId', v === 'none' ? undefined : v)
              }
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {condominiums.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
