import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import useAuditStore from '@/stores/useAuditStore'
import { format } from 'date-fns'
import { History, Activity, User, FileText, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PropertyActivityLogProps {
  propertyId: string
}

export function PropertyActivityLog({ propertyId }: PropertyActivityLogProps) {
  const { auditLogs } = useAuditStore()

  // Improved filtering to capture property specific and related entity logs
  const propertyLogs = auditLogs
    .filter(
      (log) =>
        log.entityId === propertyId ||
        (log.details && log.details.includes(propertyId)) ||
        // Include logs where the property name might be mentioned if ID isn't direct
        // Ideally backend would have robust linking, here we check common patterns
        (log.entity === 'Task' && log.entityId === propertyId) || // Task log often uses propertyId as entityId in our AppContext implementation
        (log.entity === 'Financial' && log.entityId === propertyId),
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

  const getIcon = (entity: string) => {
    switch (entity) {
      case 'Task':
        return <CheckCircle2 className="h-4 w-4 text-orange-500" />
      case 'Financial':
        return <FileText className="h-4 w-4 text-green-500" />
      case 'Property':
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" /> Detailed Activity Log
        </CardTitle>
        <CardDescription>
          Comprehensive audit trail of all operations, financial postings, and
          updates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          {propertyLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              No activity recorded for this property yet.
            </div>
          ) : (
            <div className="space-y-6 pl-2">
              {propertyLogs.map((log) => (
                <div key={log.id} className="relative pl-8 pb-2 group">
                  {/* Timeline line */}
                  <div className="absolute left-[11px] top-2 bottom-[-24px] w-px bg-border group-last:bottom-auto group-last:h-full" />
                  {/* Icon */}
                  <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-background border flex items-center justify-center z-10">
                    {getIcon(log.entity)}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-5">
                          {log.entity}
                        </Badge>
                        <span className="text-sm font-semibold capitalize">
                          {log.action}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 bg-muted/30 p-2 rounded-md border">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{log.userName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
