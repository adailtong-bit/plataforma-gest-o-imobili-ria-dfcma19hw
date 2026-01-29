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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Package,
  Upload,
  History,
  Download,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { InventoryImportDialog } from '@/components/inventory/InventoryImportDialog'
import { InventoryDeleteDialog } from '@/components/inventory/InventoryDeleteDialog'
import { InventoryHistoryDialog } from '@/components/inventory/InventoryHistoryDialog'
import { InventoryItemDialog } from '@/components/inventory/InventoryItemDialog'
import { formatDate } from '@/lib/utils'
import { exportToCSV } from '@/lib/utils'
import useTaskStore from '@/stores/useTaskStore'
import useNotificationStore from '@/stores/useNotificationStore'
import useLanguageStore from '@/stores/useLanguageStore'

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
  const { addTask, tasks } = useTaskStore()
  const { addNotification } = useNotificationStore()
  const { t, language } = useLanguageStore()
  const [filter, setFilter] = useState('')

  // Dialog States
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<InventoryItem | null>(null)
  const [editingItem, setEditingItem] = useState<
    Partial<InventoryItem> | undefined
  >(undefined)

  const inventory = data.inventory || []

  const filteredItems = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.category.toLowerCase().includes(filter.toLowerCase()),
  )

  const getLinkedTask = (inventoryItemId: string) => {
    return tasks.find((t) => t.inventoryItemId === inventoryItemId)
  }

  const handleSaveItem = (itemData: Partial<InventoryItem>) => {
    if (!itemData.name || !itemData.category) {
      toast({
        title: t('common.error'),
        description: t('common.required'),
        variant: 'destructive',
      })
      return
    }

    const now = new Date().toISOString()
    let updatedInventory = [...inventory]

    if (itemData.id) {
      const originalItem = inventory.find((i) => i.id === itemData.id)
      let newDamageHistory = originalItem?.damageHistory || []
      const isDamaged = ['Damaged', 'Broken', 'Missing', 'Poor'].includes(
        itemData.condition || '',
      )
      const wasGood = !['Damaged', 'Broken', 'Missing', 'Poor'].includes(
        originalItem?.condition || '',
      )

      if (
        isDamaged &&
        (wasGood || itemData.condition !== originalItem?.condition)
      ) {
        const damageRecordId = `dmg-${Date.now()}`
        const taskId = `task-auto-${Date.now()}`
        addTask({
          id: taskId,
          title: `Repair: ${itemData.name}`,
          propertyId: data.id,
          propertyName: data.name,
          propertyAddress: data.address,
          type: 'maintenance',
          status: 'pending',
          priority: 'high',
          description: `Auto-generated maintenance request. Item: ${itemData.name}, Condition: ${itemData.condition}.`,
          date: new Date().toISOString(),
          assignee: 'Unassigned',
          source: 'automation',
          inventoryItemId: itemData.id,
        })

        addNotification({
          title: 'Inventory Alert',
          message: `Item "${itemData.name}" reported as ${itemData.condition}.`,
          type: 'warning',
        })

        newDamageHistory = [
          {
            id: damageRecordId,
            date: now,
            description: `Condition: ${itemData.condition}. Note: ${itemData.description || ''}`,
            reportedBy: 'Manager',
            linkedTaskId: taskId,
          },
          ...newDamageHistory,
        ]

        toast({
          title: 'Damage Recorded',
          description: 'Maintenance task generated.',
        })
      }

      updatedInventory = updatedInventory.map((item) =>
        item.id === itemData.id
          ? {
              ...(itemData as InventoryItem),
              updatedAt: now,
              damageHistory: newDamageHistory,
            }
          : item,
      )
      toast({ title: t('common.success') })
    } else {
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        ...(itemData as Omit<InventoryItem, 'id'>),
        createdAt: now,
        updatedAt: now,
        damageHistory: [],
        media: itemData.media || [],
      }
      updatedInventory.push(newItem)
      toast({ title: t('common.success') })
    }

    onChange('inventory', updatedInventory)
    setIsItemDialogOpen(false)
    setEditingItem(undefined)
  }

  const handleDeleteItem = (id: string) => {
    const updatedInventory = inventory.filter((item) => item.id !== id)
    onChange('inventory', updatedInventory)
    toast({ title: t('common.removed') })
  }

  const handleBulkImport = (items: InventoryItem[]) => {
    const combined = [...inventory, ...items]
    onChange('inventory', combined)
  }

  const handleClearInventory = () => {
    onChange('inventory', [])
    toast({
      title: t('common.empty'),
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
      'Last Updated',
    ]

    const rows = filteredItems.map((item) => [
      item.name,
      item.category,
      item.quantity,
      item.condition,
      item.description || '',
      item.updatedAt ? formatDate(item.updatedAt, language) : '',
    ])

    exportToCSV(`inventory_${data.name}`, headers, rows)
    toast({ title: t('common.success') })
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
          <CardTitle>{t('common.inventory')}</CardTitle>
          <CardDescription>Manage items and conditions.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> {t('common.export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportInventory}>
                CSV
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
                <Trash2 className="h-4 w-4 mr-2" /> {t('common.delete')} All
              </Button>
              <Button
                onClick={() => {
                  setEditingItem(undefined)
                  setIsItemDialogOpen(true)
                }}
                className="gap-2 bg-trust-blue"
                size="sm"
              >
                <Plus className="h-4 w-4" /> {t('common.new')}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
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
                      <p>{t('common.empty')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const linkedTask = getLinkedTask(item.id)
                  const hasMedia = item.media && item.media.length > 0

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-2">
                            {item.name}
                            {hasMedia && (
                              <ImageIcon className="h-3 w-3 text-blue-500" />
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {item.description}
                          </span>
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
                      <TableCell>
                        {linkedTask ? (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Fix: {linkedTask.status}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            OK
                          </span>
                        )}
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
                              <TooltipContent>
                                {t('common.history')}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {canEdit && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingItem(item)
                                  setIsItemDialogOpen(true)
                                }}
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
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <InventoryItemDialog
        isOpen={isItemDialogOpen}
        onClose={() => setIsItemDialogOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
      />

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
