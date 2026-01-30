import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Badge } from '@/components/ui/badge'
import { InventoryInspection, ItemCondition } from '@/lib/types'
import { format } from 'date-fns'
import { Printer, FileText, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

interface InventoryReportViewerProps {
  isOpen: boolean
  onClose: () => void
  inspection: InventoryInspection | null
  title?: string
}

export function InventoryReportViewer({
  isOpen,
  onClose,
  inspection,
  title,
}: InventoryReportViewerProps) {
  const { toast } = useToast()
  const { t } = useLanguageStore()

  if (!inspection) return null

  const handlePrint = () => {
    toast({
      title: 'Exporting...',
      description: 'Generating PDF report for download.',
    })
    setTimeout(() => {
      window.print()
    }, 500)
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

  const issuesFound = inspection.items.filter(
    (i) =>
      i.condition === 'Damaged' ||
      i.condition === 'Broken' ||
      i.condition === 'Missing',
  ).length

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title || t('common.reports')}
          </DialogTitle>
          <DialogDescription>
            Performed on {format(new Date(inspection.date), 'PPP p')} by{' '}
            {inspection.performedBy}
          </DialogDescription>
        </DialogHeader>

        {issuesFound > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2 text-red-800 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <strong>Attention Needed:</strong> {issuesFound} items flagged as
            Damaged, Broken, or Missing.
          </div>
        )}

        <div className="flex-1 overflow-y-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.type')}</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Original</TableHead>
                <TableHead>Observed</TableHead>
                <TableHead>{t('common.description')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspection.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.originalCondition}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getConditionColor(item.condition)}
                    >
                      {item.condition}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {inspection.notes && (
          <div className="bg-muted p-4 rounded-md text-sm">
            <span className="font-semibold block mb-1">
              {t('common.description')}:
            </span>
            {inspection.notes}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> {t('common.print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
