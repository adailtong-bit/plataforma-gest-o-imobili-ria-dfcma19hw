import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function LocationTab({ form, setForm }: any) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 space-y-2">
        <Label>Street Address</Label>
        <Input
          value={form.address || ''}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Number</Label>
        <Input
          value={form.number || ''}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Complement</Label>
        <Input
          value={form.complement || ''}
          onChange={(e) => setForm({ ...form, complement: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Neighborhood</Label>
        <Input
          value={form.neighborhood || ''}
          onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Zip Code</Label>
        <Input
          value={form.zip_code || ''}
          onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>City</Label>
        <Input
          value={form.city || ''}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>State</Label>
        <Input
          value={form.state || ''}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Country</Label>
        <Input
          value={form.country || ''}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />
      </div>

      <div className="col-span-2 space-y-2 border-t pt-4 mt-2">
        <Label className="text-trust-blue font-semibold">
          Security & Access Details
        </Label>
      </div>

      <div className="space-y-2">
        <Label>Locker Code</Label>
        <Input
          value={form.locker_code || ''}
          onChange={(e) => setForm({ ...form, locker_code: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Door Access Code</Label>
        <Input
          value={form.access_code || ''}
          onChange={(e) => setForm({ ...form, access_code: e.target.value })}
        />
      </div>
    </div>
  )
}
