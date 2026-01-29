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
import { formatDate } from '@/lib/utils'
import { exportToCSV } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

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
  const { t, language } = useLanguageStore()

  if (!item) return null

  const history = item.damageHistory || []

  const handleExport = () => {
    if (history.length === 0) {
      toast({
        title: t('common.empty'),
        description: 'No history to export.',
        variant: 'destructive',
      })
      return
    }

    const headers = ['Date', 'Description', 'Reported By']
    const rows = history.map((record) => [
      record.date ? formatDate(record.date, language) : '',
      record.description,
      record.reportedBy || 'System',
    ])

    exportToCSV(`history_${item.name.replace(/\s/g, '_')}`, headers, rows)
    toast({ title: t('common.success') })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pr-4">
          <div className="space-y-1">
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t('common.history')}: {item.name}
            </DialogTitle>
            <DialogDescription>
              Historical record of reported damages and incidents.
            </DialogDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> {t('common.export')}
          </Button>
        </DialogHeader>

        <div className="mt-4 border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>{t('common.description')}</TableHead>
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
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(record.date, language)}
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
            {t('common.created_at')}:{' '}
            {item.createdAt ? formatDate(item.createdAt, language) : '-'}
          </span>
          <span>
            {t('common.updated_at')}:{' '}
            {item.updatedAt ? formatDate(item.updatedAt, language) : '-'}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
