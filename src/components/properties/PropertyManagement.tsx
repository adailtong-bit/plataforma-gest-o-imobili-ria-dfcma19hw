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
            <CardTitle>Tarefas e Manutenção Ativas</CardTitle>
            <CardDescription>
              Tarefas operacionais atribuídas a esta propriedade.
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
                        {task.type === 'cleaning'
                          ? 'Limpeza'
                          : task.type === 'maintenance'
                            ? 'Manutenção'
                            : task.type === 'inspection'
                              ? 'Inspeção'
                              : task.type.replace('_', ' ')}{' '}
                        • prioridade{' '}
                        {task.priority === 'low'
                          ? 'Baixa'
                          : task.priority === 'medium'
                            ? 'Média'
                            : task.priority === 'high'
                              ? 'Alta'
                              : task.priority === 'critical'
                                ? 'Crítica'
                                : task.priority}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.status === 'completed' ? 'default' : 'secondary'
                    }
                  >
                    {task.status === 'completed'
                      ? 'Concluído'
                      : task.status === 'pending'
                        ? 'Pendente'
                        : task.status === 'in_progress'
                          ? 'Em Progresso'
                          : task.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
              <Wrench className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p>Nenhuma tarefa ativa para esta propriedade.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bloqueios de Calendário e Disponibilidade</CardTitle>
          <CardDescription>
            Bloqueios agendados indicando manutenção ou uso do proprietário.
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
                      {block.type === 'owner_use'
                        ? 'Uso do Proprietário'
                        : block.type === 'maintenance'
                          ? 'Manutenção'
                          : block.type.replace('_', ' ')}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(block.startDate), 'dd/MM/yyyy')} -{' '}
                      {format(new Date(block.endDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
              <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p>Nenhum bloqueio de calendário ativo.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
