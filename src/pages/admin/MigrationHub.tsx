import { useState } from 'react'
import { MigrationWizard } from '@/components/migration/MigrationWizard'
import { Database, History, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import useAuditStore from '@/stores/useAuditStore'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function MigrationHub() {
  const { auditLogs } = useAuditStore()
  const importHistory = auditLogs.filter((l) => l.action === 'import')
  const [logOpen, setLogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Migration Hub
          </h1>
          <p className="text-muted-foreground">
            Import properties, owners, and historical data from external
            platforms.
          </p>
        </div>
        <Sheet open={logOpen} onOpenChange={setLogOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <History className="h-4 w-4" /> View Migration Logs
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Migration History</SheetTitle>
              <SheetDescription>
                Detailed logs of data import operations.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[80vh] mt-4 pr-4">
              <div className="space-y-4">
                {importHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No import history found.
                  </p>
                ) : (
                  importHistory.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-3 space-y-2 bg-muted/20"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">
                          {log.userName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.timestamp), 'PP pp')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{log.details}</p>
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Database className="h-3 w-3" /> Source: CIIRUS/CSV
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <MigrationWizard />

      <Card className="max-w-3xl mx-auto w-full mt-6 bg-blue-50/30 border-blue-100">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-blue-900">
              Need help migrating?
            </h3>
            <p className="text-sm text-blue-700">
              Check our documentation for CSV formatting and API limits.
            </p>
          </div>
          <Button variant="link" className="text-blue-600">
            View Docs <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
