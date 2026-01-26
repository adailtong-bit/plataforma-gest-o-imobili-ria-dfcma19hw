import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { InventoryItem, InventoryMedia } from '@/lib/types'
import { Upload, X, PlayCircle, Image as ImageIcon, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface InventoryItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: Partial<InventoryItem>) => void
  initialData?: Partial<InventoryItem>
}

export function InventoryItemDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
}: InventoryItemDialogProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    initialData || {
      name: '',
      category: '',
      quantity: 1,
      condition: 'New',
      description: '',
      media: [],
    },
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newMedia: InventoryMedia[] = Array.from(files).map((file) => {
        const isVideo = file.type.startsWith('video/')
        return {
          id: `media-${Date.now()}-${Math.random()}`,
          url: URL.createObjectURL(file),
          type: isVideo ? 'video' : 'image',
          date: new Date().toISOString(),
          notes: file.name,
        }
      })

      setFormData((prev) => ({
        ...prev,
        media: [...(prev.media || []), ...newMedia],
      }))
      toast({
        title: 'Media Added',
        description: `${newMedia.length} files attached.`,
      })
    }
  }

  const removeMedia = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media?.filter((m) => m.id !== id),
    }))
  }

  const handleSave = () => {
    onSave(formData)
  }

  const isDamaged = ['Damaged', 'Broken', 'Missing', 'Poor'].includes(
    formData.condition || '',
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Inventory Item' : 'New Inventory Item'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Item Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Sofa"
              />
            </div>
            <div className="grid gap-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Appliances">Appliances</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Kitchenware">Kitchenware</SelectItem>
                  <SelectItem value="Linens">Linens</SelectItem>
                  <SelectItem value="Decor">Decor</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, condition: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                  <SelectItem value="Broken">Broken</SelectItem>
                  <SelectItem value="Missing">Missing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description / Notes</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Details about the item..."
            />
            {isDamaged && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-800 rounded text-xs border border-yellow-200">
                <Info className="h-4 w-4" />
                <span>
                  Marking as <strong>{formData.condition}</strong> will trigger
                  an automated maintenance alert.
                </span>
              </div>
            )}
          </div>

          {/* Media Attachments */}
          <div className="grid gap-2">
            <Label>Media Attachments (Photos/Videos)</Label>
            <div
              className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload media</p>
              <p className="text-xs text-muted-foreground">
                Images and Videos allowed
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
              />
            </div>

            {/* Gallery Grid */}
            {formData.media && formData.media.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                {formData.media.map((m) => (
                  <div
                    key={m.id}
                    className="relative group aspect-square rounded-md overflow-hidden border bg-black/5"
                  >
                    {m.type === 'image' ? (
                      <img
                        src={m.url}
                        alt="Attachment"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                        <PlayCircle className="h-8 w-8" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeMedia(m.id)
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-trust-blue">
            Save Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
