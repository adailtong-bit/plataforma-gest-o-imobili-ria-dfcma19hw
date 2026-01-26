import { useState } from 'react'
import {
  Property,
  InventoryItem,
  ItemCondition,
  DamageRecord,
} from '@/lib/types'
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
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Package,
  Upload,
  History,
  Info,
  Download,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InventoryImportDialog } from '@/components/inventory/InventoryImportDialog'
import { InventoryDeleteDialog } from '@/components/inventory/InventoryDeleteDialog'
import { InventoryHistoryDialog } from '@/components/inventory/InventoryHistoryDialog'
import { format } from 'date-fns'
import { exportToCSV } from '@/lib/utils'
import useTaskStore from '@/stores/useTaskStore'

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
  const { addTask } = useTaskStore()
  const [filter, setFilter] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // New Dialog States
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<InventoryItem | null>(null)

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

    const now = new Date().toISOString()
    let updatedInventory = [...inventory]

    if (editingItem.id) {
      // Update logic
      const originalItem = inventory.find((i) => i.id === editingItem.id)

      // Check for damage logging
      let newDamageHistory = originalItem?.damageHistory || []
      const isDamaged = ['Damaged', 'Broken', 'Missing', 'Poor'].includes(
        editingItem.condition || '',
      )
      const wasGood = !['Damaged', 'Broken', 'Missing', 'Poor'].includes(
        originalItem?.condition || '',
      )

      if (
        isDamaged &&
        (wasGood || editingItem.condition !== originalItem?.condition)
      ) {
        // Auto-log damage
        newDamageHistory = [
          {
            id: `dmg-${Date.now()}`,
            date: now,
            description: `Condition changed to ${editingItem.condition}. Note: ${editingItem.description || 'No description provided.'}`,
            reportedBy: 'Manager',
          },
          ...newDamageHistory,
        ]

        // Auto-generate Maintenance Task
        addTask({
          id: `task-auto-${Date.now()}`,
          title: `Repair: ${editingItem.name}`,
          propertyId: data.id,
          propertyName: data.name,
          propertyAddress: data.address,
          type: 'maintenance',
          status: 'pending',
          priority: 'high',
          description: `Auto-generated maintenance request due to inventory damage report. Item: ${editingItem.name}, Condition: ${editingItem.condition}`,
          date: new Date().toISOString(),
          assignee: 'Unassigned',
          source: 'automation',
        })

        toast({
          title: 'Damage Recorded & Task Created',
          description: 'A maintenance task has been automatically generated.',
        })
      }

      updatedInventory = updatedInventory.map((item) =>
        item.id === editingItem.id
          ? {
              ...(editingItem as InventoryItem),
              updatedAt: now,
              damageHistory: newDamageHistory,
            }
          : item,
      )
      toast({ title: 'Item Updated' })
    } else {
      // Create logic
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        ...(editingItem as Omit<InventoryItem, 'id'>),
        createdAt: now,
        updatedAt: now,
        damageHistory: [],
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

  const handleBulkImport = (items: InventoryItem[]) => {
    const combined = [...inventory, ...items]
    onChange('inventory', combined)
  }

  const handleClearInventory = () => {
    onChange('inventory', [])
    toast({
      title: 'Inventory Cleared',
      description: 'All items have been removed.',
    })
  }

  const handleViewHistory = (item: InventoryItem) => {
    setSelectedHistoryItem(item)
    setIsHistoryOpen(true)
  }

  const handleExportInventory = () => {
    const headers = [
      'Item Name',
      'Category',
      'Quantity',
      'Condition',
      'Description',
      'Created At',
      'Last Updated',
    ]

    const rows = filteredItems.map((item) => [
      item.name,
      item.category,
      item.quantity,
      item.condition,
      item.description || '',
      item.createdAt
        ? format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')
        : '',
      item.updatedAt
        ? format(new Date(item.updatedAt), 'yyyy-MM-dd HH:mm')
        : '',
    ])

    exportToCSV(`inventory_${data.name}`, headers, rows)
    toast({ title: 'Inventory Exported' })
  }

  const handleExportDamages = () => {
    const headers = ['Item Name', 'Damage Date', 'Description', 'Reported By']

    const rows: string[][] = []

    inventory.forEach((item) => {
      if (item.damageHistory && item.damageHistory.length > 0) {
        item.damageHistory.forEach((log) => {
          rows.push([
            item.name,
            log.date ? format(new Date(log.date), 'yyyy-MM-dd HH:mm') : '',
            log.description,
            log.reportedBy || 'Unknown',
          ])
        })
      }
    })

    if (rows.length === 0) {
      toast({
        title: 'No Data',
        description: 'No damage records found to export.',
        variant: 'destructive',
      })
      return
    }

    exportToCSV(`damage_log_${data.name}`, headers, rows)
    toast({ title: 'Damage Log Exported' })
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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Good':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Poor':
      case 'Damaged':
      case 'Broken':
      case 'Missing':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Manage items, track condition history, and import bulk data.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportInventory}>
                Inventory List (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportDamages}>
                Damage History Log (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" /> Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
                disabled={inventory.length === 0}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Clear All
              </Button>
              <Button
                onClick={() => {
                  resetForm()
                  setIsDialogOpen(true)
                }}
                className="gap-2 bg-trust-blue"
                size="sm"
              >
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </>
          )}
        </div>
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

        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="hidden md:table-cell">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                      <p>No inventory items found.</p>
                      {canEdit && (
                        <Button
                          variant="link"
                          onClick={() => setIsImportOpen(true)}
                        >
                          Import from Excel/CSV
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground md:hidden truncate max-w-[150px]">
                        {item.description}
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getConditionColor(item.condition)}
                      >
                        {item.condition}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {item.updatedAt
                        ? format(new Date(item.updatedAt), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewHistory(item)}
                              >
                                <History className="h-4 w-4 text-blue-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View History</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {canEdit && (
                          <>
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
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
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
                placeholder="Details about the item..."
              />
              {['Damaged', 'Broken', 'Missing', 'Poor'].includes(
                editingItem.condition || '',
              ) && (
                <p className="text-xs text-yellow-600 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Changing condition to {editingItem.condition} will record a
                  damage log entry and create a maintenance task.
                </p>
              )}
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

      <InventoryImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleBulkImport}
      />

      <InventoryDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleClearInventory}
        count={inventory.length}
      />

      <InventoryHistoryDialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        item={selectedHistoryItem}
      />
    </Card>
  )
}
