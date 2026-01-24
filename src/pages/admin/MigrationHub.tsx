import { MigrationWizard } from '@/components/migration/MigrationWizard'
import { Database, History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useAuditStore from '@/stores/useAuditStore'
import { format } from 'date-fns'

export default function MigrationHub() {
  const { auditLogs } = useAuditStore()
  const importHistory = auditLogs.filter((l) => l.action === 'import')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Migration Hub
        </h1>
        <p className="text-muted-foreground">
          Import properties, owners, and historical data from external
          platforms.
        </p>
      </div>

      <MigrationWizard />

      {importHistory.length > 0 && (
        <Card className="max-w-3xl mx-auto w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" /> Import History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {importHistory.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-sm">{log.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.details}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), 'PP pp')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
