import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList } from 'lucide-react'
import { TaskCard } from '@/components/tasks/TaskCard'
import useTaskStore from '@/stores/useTaskStore'

interface PropertyTasksProps {
  propertyId: string
  canEdit: boolean
}

export function PropertyTasks({ propertyId, canEdit }: PropertyTasksProps) {
  const { tasks, updateTaskStatus, addTaskImage, addTaskEvidence } =
    useTaskStore()

  const propertyTasks = tasks.filter((t) => t.propertyId === propertyId)

  // Sort by date descending
  const sortedTasks = [...propertyTasks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" /> Histórico de Tarefas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhuma tarefa registrada para esta propriedade.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(status) => updateTaskStatus(task.id, status)}
                onUpload={canEdit ? addTaskImage : undefined}
                onAddEvidence={canEdit ? addTaskEvidence : undefined}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
