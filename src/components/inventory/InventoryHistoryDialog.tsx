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
import { InventoryItem } from '@/lib/types'
import { History, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

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
  if (!item) return null

  const history = item.damageHistory || []

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Damage History: {item.name}
          </DialogTitle>
          <DialogDescription>
            Historical record of reported damages and incidents.
          </DialogDescription>
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
