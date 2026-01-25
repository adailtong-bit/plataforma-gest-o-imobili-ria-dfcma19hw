import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { InventoryItem } from '@/lib/types'
import { History, AlertTriangle, Download } from 'lucide-react'
import { format } from 'date-fns'
import { exportToCSV } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface InventoryHistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem | null
}

export function InventoryHistoryDialog({
  isOpen,
  onClose,
  item,
}: InventoryHistoryDialogProps) {
  const { toast } = useToast()

  if (!item) return null

  const history = item.damageHistory || []

  const handleExport = () => {
    if (history.length === 0) {
      toast({
        title: 'No Data',
        description: 'No history to export.',
        variant: 'destructive',
      })
      return
    }

    const headers = ['Date', 'Description', 'Reported By']
    const rows = history.map((record) => [
      record.date ? format(new Date(record.date), 'yyyy-MM-dd HH:mm') : '',
      record.description,
      record.reportedBy || 'System',
    ])

    exportToCSV(`history_${item.name.replace(/\s/g, '_')}`, headers, rows)
    toast({ title: 'History Exported' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pr-4">
          <div className="space-y-1">
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Damage History: {item.name}
            </DialogTitle>
            <DialogDescription>
              Historical record of reported damages and incidents.
            </DialogDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </DialogHeader>

        <div className="mt-4 border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reported By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No damage history recorded for this item.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{record.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.reportedBy || 'System'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-muted-foreground mt-2 flex justify-between">
          <span>
            Created:{' '}
            {item.createdAt
              ? format(new Date(item.createdAt), 'PPP')
              : 'Unknown'}
          </span>
          <span>
            Last Updated:{' '}
            {item.updatedAt
              ? format(new Date(item.updatedAt), 'PPP')
              : 'Unknown'}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
