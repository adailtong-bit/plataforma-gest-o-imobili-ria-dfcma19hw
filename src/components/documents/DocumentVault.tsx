import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Plus,
  ShieldCheck,
} from 'lucide-react'
import { format } from 'date-fns'
import { GenericDocument, DocumentCategory } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface DocumentVaultProps {
  documents: GenericDocument[]
  onUpdate: (docs: GenericDocument[]) => void
  canEdit?: boolean
  entityContext?: {
    id: string
    type: 'tenant' | 'owner' | 'partner'
    name: string
  }
}

export function DocumentVault({
  documents,
  onUpdate,
  canEdit = false,
  entityContext,
}: DocumentVaultProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState<Partial<GenericDocument>>({
    category: 'Other',
  })

  const handleAdd = () => {
    if (!form.name || !form.url) return
    const newDoc: GenericDocument = {
      id: `doc-${Date.now()}`,
      name: form.name,
      url: form.url,
      category: (form.category as DocumentCategory) || 'Other',
      date: new Date().toISOString(),
      linkedEntityId: entityContext?.id,
      linkedEntityType: entityContext?.type,
      linkedEntityName: entityContext?.name,
    }
    onUpdate([...documents, newDoc])
    setIsAddOpen(false)
    setForm({ category: 'Other' })
  }

  const handleRemove = (id: string) => {
    onUpdate(documents.filter((d) => d.id !== id))
  }

  const categories: DocumentCategory[] = [
    'Contract',
    'Insurance',
    'ID',
    'Passport',
    'SSN',
    'DriverLicense',
    'Other',
  ]

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Document
          </Button>
        </div>
      )}

      <div className="border rounded-md divide-y bg-white">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  {doc.name}
                  {doc.category === 'Contract' && (
                    <ShieldCheck
                      className="h-3 w-3 text-green-600"
                      title="Legal Document"
                    />
                  )}
                </p>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                    {doc.category}
                  </span>
                  <span>{format(new Date(doc.date), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" title="View" asChild>
                <a href={doc.url} target="_blank" rel="noreferrer">
                  <Eye className="h-4 w-4 text-slate-600" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" title="Download">
                <Download className="h-4 w-4 text-slate-600" />
              </Button>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(doc.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            No documents uploaded yet.
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Document Name</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Signed Lease Agreement"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm({ ...form, category: v as DocumentCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File URL (Mock Upload)</Label>
              <Input
                value={form.url || ''}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.url}>
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
