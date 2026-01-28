import { useState } from 'react'
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
import { ServiceCategory } from '@/lib/types'
import usePartnerStore from '@/stores/usePartnerStore'
import { Trash2, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ServiceCategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Indigo', value: '#6366f1' },
]

export function ServiceCategoriesDialog({
  open,
  onOpenChange,
}: ServiceCategoriesDialogProps) {
  const {
    serviceCategories,
    addServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
  } = usePartnerStore()
  const { toast } = useToast()

  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0].value)

  const handleSave = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required.',
        variant: 'destructive',
      })
      return
    }

    if (editingCategory) {
      updateServiceCategory({
        ...editingCategory,
        name: newCategoryName,
        color: newCategoryColor,
      })
      toast({ title: 'Category Updated' })
      setEditingCategory(null)
    } else {
      addServiceCategory({
        id: `cat-${Date.now()}`,
        name: newCategoryName,
        color: newCategoryColor,
      })
      toast({ title: 'Category Created' })
    }

    setNewCategoryName('')
    setNewCategoryColor(COLORS[0].value)
  }

  const handleEdit = (category: ServiceCategory) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setNewCategoryColor(category.color)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteServiceCategory(id)
      toast({ title: 'Category Deleted' })
    }
  }

  const handleCancel = () => {
    setEditingCategory(null)
    setNewCategoryName('')
    setNewCategoryColor(COLORS[0].value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Service Categories</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2 p-4 border rounded-md bg-muted/20">
            <h4 className="font-medium text-sm">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h4>
            <div className="flex gap-2 items-end">
              <div className="grid gap-1 flex-1">
                <Label htmlFor="catName" className="text-xs">
                  Name
                </Label>
                <Input
                  id="catName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Landscaping"
                />
              </div>
              <div className="grid gap-1 w-[120px]">
                <Label className="text-xs">Color</Label>
                <Select
                  value={newCategoryColor}
                  onValueChange={setNewCategoryColor}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: c.value }}
                          />
                          {c.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              {editingCategory && (
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
              <Button size="sm" onClick={handleSave}>
                {editingCategory ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Existing Categories</Label>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {serviceCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-sm">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(cat)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {serviceCategories.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No categories defined.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
