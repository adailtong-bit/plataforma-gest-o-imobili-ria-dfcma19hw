import { useState, useEffect } from 'react'
import {
  InventoryInspection,
  InventoryCheckResult,
  ItemCondition,
} from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckSquare } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import useLanguageStore from '@/stores/useLanguageStore'

interface InventoryInspectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (inspection: InventoryInspection) => void
  onSkip?: () => void
  propertyId: string
  type: 'check_in' | 'check_out'
  title: string
  isOptional?: boolean
  performedBy: string
}

export function InventoryInspectionModal({
  isOpen,
  onClose,
  onSave,
  onSkip,
  propertyId,
  type,
  title,
  isOptional,
  performedBy,
}: InventoryInspectionModalProps) {
  const { t } = useLanguageStore()
  const { properties } = usePropertyStore()
  const property = properties.find((p) => p.id === propertyId)
  const [items, setItems] = useState<InventoryCheckResult[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen && property?.inventory) {
      const checklist: InventoryCheckResult[] = property.inventory.map(
        (item) => ({
          itemId: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          originalCondition: item.condition,
          condition: item.condition,
          notes: '',
        }),
      )
      setItems(checklist)
      setNotes('')
    }
  }, [isOpen, property])

  const handleConditionChange = (index: number, condition: ItemCondition) => {
    const updatedItems = [...items]
    updatedItems[index].condition = condition
    setItems(updatedItems)
  }

  const handleNoteChange = (index: number, note: string) => {
    const updatedItems = [...items]
    updatedItems[index].notes = note
    setItems(updatedItems)
  }

  const handleSave = () => {
    const inspection: InventoryInspection = {
      id: `insp-${Date.now()}`,
      date: new Date().toISOString(),
      type,
      performedBy,
      items,
      notes,
    }
    onSave(inspection)
    onClose()
  }

  const changesCount = items.filter(
    (i) => i.condition !== i.originalCondition,
  ).length

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" /> {title}
          </DialogTitle>
          <DialogDescription>
            {t('common.confirm')} {t('common.details')}
            {changesCount > 0 && (
              <span className="ml-2 text-yellow-600 font-medium">
                ({changesCount} changes detected)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto border rounded-md min-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">{t('common.name')}</TableHead>
                <TableHead>{t('common.type')}</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="w-[150px]">Observed State</TableHead>
                <TableHead>{t('common.description')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No inventory items listed for this property.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.originalCondition}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.condition}
                        onValueChange={(v: ItemCondition) =>
                          handleConditionChange(index, v)
                        }
                      >
                        <SelectTrigger
                          className={
                            item.condition !== item.originalCondition
                              ? 'border-yellow-500 bg-yellow-50'
                              : ''
                          }
                        >
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
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.notes || ''}
                        onChange={(e) =>
                          handleNoteChange(index, e.target.value)
                        }
                        placeholder={
                          item.condition === 'Missing' ||
                          item.condition === 'Damaged'
                            ? 'Required...'
                            : 'Optional'
                        }
                        className={
                          (item.condition === 'Missing' ||
                            item.condition === 'Damaged') &&
                          !item.notes
                            ? 'border-red-300'
                            : ''
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-2 py-2">
          <Label>{t('common.description')}</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any general comments about the property state..."
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isOptional && onSkip && (
            <Button variant="ghost" onClick={onSkip} className="mr-auto">
              Skip Inspection
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} className="bg-trust-blue">
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
