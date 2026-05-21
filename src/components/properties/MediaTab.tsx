import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FileUpload } from '@/components/ui/file-upload'

export function MediaTab({ form, setForm, setImageFile }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold text-slate-900 mb-4 block">
          Connectivity
        </Label>
        <div className="space-y-2">
          <Label>Internet/Wi-Fi Link</Label>
          <Input
            value={form.internet_link || ''}
            onChange={(e) =>
              setForm({ ...form, internet_link: e.target.value })
            }
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-lg font-semibold text-slate-900 mb-4 block">
          Media
        </Label>
        <div className="space-y-4">
          <FileUpload
            label="Property Image"
            value={form.image}
            onChange={(url, file) => {
              setForm({ ...form, image: url })
              if (file) setImageFile(file)
            }}
            accept="image/*"
          />
          {form.image && (
            <div className="mt-4">
              <Label className="mb-2 block">Preview</Label>
              <img
                src={form.image}
                alt="Property Preview"
                className="w-full max-w-sm rounded-md border shadow-sm object-cover"
                crossOrigin="anonymous"
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-lg font-semibold text-slate-900 mb-4 block">
          Specifications
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Area (m²)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.area || ''}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
