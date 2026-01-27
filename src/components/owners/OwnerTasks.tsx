import { useState } from 'react'
import { Property, Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClipboardList } from 'lucide-react'
import { TaskCard } from '@/components/tasks/TaskCard'
import useTaskStore from '@/stores/useTaskStore'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

interface OwnerTasksProps {
  ownerId: string
  properties: Property[]
}

export function OwnerTasks({ ownerId, properties }: OwnerTasksProps) {
  const { tasks, updateTaskStatus } = useTaskStore()
  const [selectedPropertyId, setSelectedPropertyId] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')

  const ownerProperties = properties.filter((p) => p.ownerId === ownerId)
  const ownerPropertyIds = ownerProperties.map((p) => p.id)

  const ownerTasks = tasks.filter((t) => {
    // Property Filter
    if (selectedPropertyId !== 'all' && t.propertyId !== selectedPropertyId)
      return false
    // Ownership Filter
    return ownerPropertyIds.includes(t.propertyId)
  })

  // Apply Time Filter
  const filteredTasks = ownerTasks.filter((t) => {
    if (timeFilter === 'all') return true
    const taskDate = new Date(t.date)
    const now = new Date()

    if (timeFilter === 'this_month') {
      return isWithinInterval(taskDate, {
        start: startOfMonth(now),
        end: endOfMonth(now),
      })
    }
    return true
  })

  // Sort by date descending
  const sortedTasks = [...filteredTasks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" /> Histórico de Tarefas e
          Manutenções
        </CardTitle>
        <div className="flex gap-2">
          <Select
            value={selectedPropertyId}
            onValueChange={setSelectedPropertyId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Propriedade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Propriedades</SelectItem>
              {ownerProperties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o Período</SelectItem>
              <SelectItem value="this_month">Este Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhuma tarefa registrada para as propriedades deste proprietário no
            período selecionado.
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


