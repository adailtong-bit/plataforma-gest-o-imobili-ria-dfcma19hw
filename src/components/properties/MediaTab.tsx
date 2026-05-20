import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FileUpload } from '@/components/ui/file-upload'

export function MediaTab({ form, setForm, setImageFile }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Internet Link (Wi-Fi details / Portal)</Label>
        <Input
          value={form.internet_link || ''}
          onChange={(e) => setForm({ ...form, internet_link: e.target.value })}
          placeholder="https://..."
        />
      </div>

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
