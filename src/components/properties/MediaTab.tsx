import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FileUpload } from '@/components/ui/file-upload'

export function MediaTab({ form, setForm, setImageFile }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FileUpload
          label="Property Image"
          value={form.image}
          onChange={(url, file) => {
            setForm({ ...form, image: url })
            if (file) setImageFile(file)
          }}
          accept="image/*"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="space-y-2">
          <Label>Area (m²)</Label>
          <Input
            type="number"
            value={form.area || ''}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
