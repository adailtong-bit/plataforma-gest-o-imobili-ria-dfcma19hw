import { Property, Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Building2 } from 'lucide-react'
import { TaskCard } from '@/components/tasks/TaskCard'
import useTaskStore from '@/stores/useTaskStore'

interface OwnerTasksProps {
  ownerId: string
  properties: Property[]
}

export function OwnerTasks({ ownerId, properties }: OwnerTasksProps) {
  const { tasks, updateTaskStatus } = useTaskStore()

  const ownerPropertyIds = properties
    .filter((p) => p.ownerId === ownerId)
    .map((p) => p.id)

  const ownerTasks = tasks.filter((t) =>
    ownerPropertyIds.includes(t.propertyId),
  )

  // Sort by date descending
  const sortedTasks = [...ownerTasks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" /> Histórico de Tarefas e
          Manutenções
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhuma tarefa registrada para as propriedades deste proprietário.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(status) => updateTaskStatus(task.id, status)}
                // Read-only view for owner mostly, but using TaskCard for consistency
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
