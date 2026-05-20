import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function BasicTab({ form, setForm, owners, hotels, condos }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Property Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Sunny Villa"
          />
        </div>
        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select
            value={form.type || 'house'}
            onValueChange={(v) =>
              setForm({
                ...form,
                type: v,
                hotel_id: v === 'room' ? form.hotel_id : null,
                condominium_id: v !== 'room' ? form.condominium_id : null,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="room">Room (Hotel)</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Rental Profile</Label>
          <Select
            value={form.profile_type || 'short_term'}
            onValueChange={(v) => setForm({ ...form, profile_type: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rental Profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short_term">Short Term (Vacation)</SelectItem>
              <SelectItem value="long_term">Long Term</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Owner</Label>
          <Select
            value={form.owner_id || 'none'}
            onValueChange={(v) =>
              setForm({ ...form, owner_id: v === 'none' ? null : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {owners?.map((o: any) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Listing Price ($)</Label>
          <Input
            type="number"
            value={form.listing_price || ''}
            onChange={(e) =>
              setForm({ ...form, listing_price: e.target.value })
            }
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label>HOA Value ($)</Label>
          <Input
            type="number"
            value={form.hoa_value || ''}
            onChange={(e) => setForm({ ...form, hoa_value: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-lg font-semibold text-slate-900 mb-4 block">
          Associations
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              className={
                form.type === 'room' ? 'text-trust-blue font-semibold' : ''
              }
            >
              Hotel Association{' '}
              {form.type === 'room' && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={form.hotel_id || 'none'}
              onValueChange={(v) =>
                setForm({ ...form, hotel_id: v === 'none' ? null : v })
              }
            >
              <SelectTrigger
                className={form.type === 'room' ? 'border-trust-blue' : ''}
              >
                <SelectValue placeholder="Select Hotel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {hotels?.map((h: any) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              className={
                form.type !== 'room' ? 'text-trust-blue font-semibold' : ''
              }
            >
              Condominium Association{' '}
              {form.type !== 'room' && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={form.condominium_id || 'none'}
              onValueChange={(v) =>
                setForm({ ...form, condominium_id: v === 'none' ? null : v })
              }
            >
              <SelectTrigger
                className={form.type !== 'room' ? 'border-trust-blue' : ''}
              >
                <SelectValue placeholder="Select Condominium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {condos?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-lg font-semibold text-slate-900 mb-4 block">
          Details
        </Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Input
              type="number"
              value={form.bedrooms || ''}
              onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <Input
              type="number"
              value={form.bathrooms || ''}
              onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Max Guests</Label>
            <Input
              type="number"
              value={form.guests || ''}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
            />
          </div>
          {form.type === 'room' && (
            <>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  value={form.room_number || ''}
                  onChange={(e) =>
                    setForm({ ...form, room_number: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Floor</Label>
                <Input
                  value={form.floor || ''}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
