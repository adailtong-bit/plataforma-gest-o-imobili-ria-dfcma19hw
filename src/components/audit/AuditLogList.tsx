import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import useAuditStore from '@/stores/useAuditStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AuditLogList() {
  const { auditLogs } = useAuditStore()
  const { t } = useLanguageStore()

  // Sort logs by newest first
  const sortedLogs = [...auditLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'login':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                sortedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {log.userName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getActionColor(log.action)}
                      >
                        {log.action.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.entity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
