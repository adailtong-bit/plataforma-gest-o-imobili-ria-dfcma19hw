import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { InventoryItem, ItemCondition } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface InventoryImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (items: InventoryItem[]) => void
}

export function InventoryImportDialog({
  isOpen,
  onClose,
  onImport,
}: InventoryImportDialogProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const parseCSV = (text: string): InventoryItem[] => {
    const lines = text.split('\n')
    const items: InventoryItem[] = []

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Simple CSV parse (handling comma separation)
      // Expected format: Name, Category, Quantity, Condition, Description
      const parts = line.split(',')

      if (parts.length < 3) continue

      const name = parts[0]?.trim() || 'Unknown Item'
      const category = parts[1]?.trim() || 'Other'
      const quantity = parseInt(parts[2]?.trim()) || 1
      const conditionRaw = parts[3]?.trim()
      const description = parts.slice(4).join(',').trim()

      let condition: ItemCondition = 'New'
      const validConditions: ItemCondition[] = [
        'New',
        'Good',
        'Fair',
        'Poor',
        'Damaged',
        'Missing',
        'Broken',
      ]

      if (validConditions.includes(conditionRaw as ItemCondition)) {
        condition = conditionRaw as ItemCondition
      }

      items.push({
        id: `imp-${Date.now()}-${i}`,
        name,
        category,
        quantity,
        condition,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    return items
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsProcessing(true)

    try {
      if (selectedFile.name.endsWith('.csv')) {
        const text = await selectedFile.text()
        const items = parseCSV(text)
        if (items.length === 0) {
          throw new Error('No valid items found in CSV')
        }
        onImport(items)
        toast({
          title: 'Import Successful',
          description: `Imported ${items.length} items from CSV.`,
        })
        onClose()
      } else {
        // Mock Excel Import since we can't use xlsx library
        // In a real app, this would send the file to backend or use xlsx library
        setTimeout(() => {
          const mockItems: InventoryItem[] = [
            {
              id: `imp-xls-${Date.now()}-1`,
              name: 'Imported Sofa (Excel)',
              category: 'Furniture',
              quantity: 1,
              condition: 'Good',
              description: 'Imported from Excel spreadsheet',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: `imp-xls-${Date.now()}-2`,
              name: 'Imported TV (Excel)',
              category: 'Electronics',
              quantity: 2,
              condition: 'New',
              description: 'Smart TV 55"',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]
          onImport(mockItems)
          toast({
            title: 'Excel Import Simulated',
            description:
              'Imported 2 sample items (Excel parsing requires backend).',
          })
          onClose()
        }, 1500)
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Could not parse the file. Please check format.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Inventory</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to populate the inventory.
            <br />
            <span className="text-xs text-muted-foreground mt-1 block">
              Format: Name, Category, Quantity, Condition, Description
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Click to select file</p>
            <p className="text-xs text-muted-foreground">.csv, .xlsx, .xls</p>
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 border rounded bg-blue-50 text-blue-700 text-sm">
              <Upload className="h-4 w-4" />
              <span className="truncate flex-1">{selectedFile.name}</span>
              <span className="text-xs text-blue-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}
          {!selectedFile?.name.endsWith('.csv') && selectedFile && (
            <div className="flex items-start gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Note: Excel files will be simulated in this demo environment.
                Use CSV for real parsing logic.
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? 'Importing...' : 'Import Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
