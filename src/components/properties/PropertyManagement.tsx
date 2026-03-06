import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Property } from '@/lib/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Wrench, CheckCircle2, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  property: Property
}

export function PropertyManagement({ property }: Props) {
  const context = useContext(AppContext)
  if (!context) return null

  const { tasks, calendarBlocks } = context

  const propertyTasks = tasks.filter((t) => t.propertyId === property.id)
  const propertyBlocks = calendarBlocks.filter(
    (b) => b.propertyId === property.id,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Active Tasks & Maintenance</CardTitle>
            <CardDescription>
              Operational tasks currently assigned to this property.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {propertyTasks.length > 0 ? (
            <div className="space-y-4">
              {propertyTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${task.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'}`}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground capitalize">
                        {task.type.replace('_', ' ')} • {task.priority} priority
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.status === 'completed' ? 'default' : 'secondary'
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
              <Wrench className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p>No active tasks for this property.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Blocks & Availability</CardTitle>
          <CardDescription>
            Scheduled blocks indicating maintenance or owner use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {propertyBlocks.length > 0 ? (
            <div className="space-y-4">
              {propertyBlocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="bg-slate-100 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm capitalize">
                      {block.type.replace('_', ' ')}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(block.startDate), 'MMM dd, yyyy')} -{' '}
                      {format(new Date(block.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
              <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p>No active calendar blocks.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
