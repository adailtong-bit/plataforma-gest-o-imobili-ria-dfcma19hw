import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAuditStore from '@/stores/useAuditStore'
import { format } from 'date-fns'

export function AuditLogList() {
  const { auditLogs } = useAuditStore()

  const sortedLogs = [...auditLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <div className="border rounded-md bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLogs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-6 text-muted-foreground"
              >
                No activity logs available.
              </TableCell>
            </TableRow>
          ) : (
            sortedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{format(new Date(log.timestamp), 'PPpp')}</TableCell>
                <TableCell className="font-medium">{log.userName}</TableCell>
                <TableCell className="capitalize">{log.action}</TableCell>
                <TableCell>{log.entity}</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
