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
import { History, Activity } from 'lucide-react'

interface PropertyActivityLogProps {
  propertyId: string
}

export function PropertyActivityLog({ propertyId }: PropertyActivityLogProps) {
  const { auditLogs } = useAuditStore()

  // Filter logs for this property or related entities (tasks for this property, etc.)
  // In a real app, entityId linking would be strictly enforced.
  // Here we mock filter by looking for propertyId in details or entityId
  const propertyLogs = auditLogs
    .filter(
      (log) =>
        log.entityId === propertyId ||
        log.details?.includes(propertyId) ||
        (log.entity === 'Task' && log.details?.includes(propertyId)),
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" /> Operational Activity Log
        </CardTitle>
        <CardDescription>
          History of all interactions, updates, and data changes for this
          property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          {propertyLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity recorded yet.
            </div>
          ) : (
            <div className="space-y-6">
              {propertyLogs.map((log) => (
                <div key={log.id} className="relative pl-6 pb-2">
                  {/* Timeline line */}
                  <div className="absolute left-0 top-2 bottom-0 w-px bg-border" />
                  {/* Dot */}
                  <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-background" />

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {log.action.toUpperCase()} - {log.entity}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.timestamp), 'PP pp')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                      <Activity className="h-3 w-3" />
                      by {log.userName}
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
