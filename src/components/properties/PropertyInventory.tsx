import { useState } from 'react'
import { Property, InventoryItem, ItemCondition } from '@/lib/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Edit2, Search, Package } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

interface PropertyInventoryProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
}

export function PropertyInventory({
  data,
  onChange,
  canEdit,
}: PropertyInventoryProps) {
  const { toast } = useToast()
  const [filter, setFilter] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    quantity: 1,
    condition: 'New',
    description: '',
  })

  const inventory = data.inventory || []

  const filteredItems = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.category.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleSaveItem = () => {
    if (!editingItem.name || !editingItem.category) {
      toast({
        title: 'Error',
        description: 'Name and Category are required.',
        variant: 'destructive',
      })
      return
    }

    let updatedInventory = [...inventory]

    if (editingItem.id) {
      // Edit
      updatedInventory = updatedInventory.map((item) =>
        item.id === editingItem.id ? (editingItem as InventoryItem) : item,
      )
      toast({ title: 'Item Updated' })
    } else {
      // Create
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        ...(editingItem as Omit<InventoryItem, 'id'>),
      }
      updatedInventory.push(newItem)
      toast({ title: 'Item Added' })
    }

    onChange('inventory', updatedInventory)
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDeleteItem = (id: string) => {
    const updatedInventory = inventory.filter((item) => item.id !== id)
    onChange('inventory', updatedInventory)
    toast({ title: 'Item Removed' })
  }

  const resetForm = () => {
    setEditingItem({
      name: '',
      category: '',
      quantity: 1,
      condition: 'New',
      description: '',
    })
  }

  const openEdit = (item: InventoryItem) => {
    setEditingItem({ ...item })
    setIsDialogOpen(true)
  }

  const getConditionColor = (condition: ItemCondition) => {
    switch (condition) {
      case 'New':
        return 'bg-green-100 text-green-800'
      case 'Good':
        return 'bg-blue-100 text-blue-800'
      case 'Fair':
        return 'bg-yellow-100 text-yellow-800'
      case 'Poor':
      case 'Damaged':
      case 'Broken':
      case 'Missing':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Master Inventory</CardTitle>
          <CardDescription>
            Manage the list of items belonging to this property.
          </CardDescription>
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              resetForm()
              setIsDialogOpen(true)
            }}
            className="gap-2 bg-trust-blue"
          >
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Description</TableHead>
                {canEdit && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                      <p>No items found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getConditionColor(item.condition)}
                      >
                        {item.condition}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {item.description}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem.id ? 'Edit Item' : 'New Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  placeholder="e.g. Sofa"
                />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={editingItem.category}
                  onValueChange={(v) =>
                    setEditingItem({ ...editingItem, category: v })
                  }
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
                  value={editingItem.quantity}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Condition</Label>
                <Select
                  value={editingItem.condition}
                  onValueChange={(v: any) =>
                    setEditingItem({ ...editingItem, condition: v })
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
              <Input
                value={editingItem.description || ''}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
