import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { tasks } from '@/lib/mockData'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertTriangle, Plus, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Tasks() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'medium':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Tarefas & Manutenção
          </h1>
          <p className="text-muted-foreground">
            Gerencie limpezas, reparos e inspeções.
          </p>
        </div>
        <Button className="bg-trust-blue gap-2">
          <Plus className="h-4 w-4" /> Nova Tarefa
        </Button>
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board">Quadro (Kanban)</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="cleaners">Equipes</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full min-h-[500px]">
            {/* Pending Column */}
            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                  Pendente
                </h3>
                <Badge variant="secondary">
                  {tasks.filter((t) => t.status === 'pending').length}
                </Badge>
              </div>
              {tasks
                .filter((t) => t.status === 'pending')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    priorityColor={getPriorityColor(task.priority)}
                  />
                ))}
            </div>

            {/* In Progress Column */}
            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase text-blue-600">
                  Em Progresso
                </h3>
                <Badge className="bg-blue-100 text-blue-700">
                  {tasks.filter((t) => t.status === 'in_progress').length}
                </Badge>
              </div>
              {tasks
                .filter((t) => t.status === 'in_progress')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    priorityColor={getPriorityColor(task.priority)}
                  />
                ))}
            </div>

            {/* Approval Column */}
            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase text-orange-600">
                  Aprovação
                </h3>
                <Badge className="bg-orange-100 text-orange-700">0</Badge>
              </div>
              {/* No tasks for approval in mock data, adding placeholder */}
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 text-center text-sm text-muted-foreground">
                Arraste itens aqui
              </div>
            </div>

            {/* Completed Column */}
            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase text-green-600">
                  Concluído
                </h3>
                <Badge className="bg-green-100 text-green-700">
                  {tasks.filter((t) => t.status === 'completed').length}
                </Badge>
              </div>
              {tasks
                .filter((t) => t.status === 'completed')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    priorityColor={getPriorityColor(task.priority)}
                  />
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-6">
              <p>Modo lista a ser implementado com Tabela Shadcn.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TaskCard({
  task,
  priorityColor,
}: {
  task: any
  priorityColor: string
}) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={priorityColor}>
            {task.priority}
          </Badge>
          {task.type === 'cleaning' && (
            <Badge variant="secondary">Limpeza</Badge>
          )}
          {task.type === 'maintenance' && (
            <Badge variant="secondary">Reparo</Badge>
          )}
          {task.type === 'inspection' && (
            <Badge variant="secondary">Inspeção</Badge>
          )}
        </div>
        <CardTitle className="text-sm font-semibold leading-tight">
          {task.title}
        </CardTitle>
        <CardDescription className="text-xs">
          {task.propertyName}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Clock className="h-3 w-3" />
          <span>{new Date(task.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs font-medium bg-secondary px-2 py-1 rounded-full">
            {task.assignee}
          </div>
        </div>
      </CardContent>
      {task.status === 'in_progress' && (
        <CardFooter className="p-2 pt-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-7"
              >
                <Upload className="h-3 w-3 mr-1" /> Fotos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Evidências</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="picture">Antes (Foto)</Label>
                  <Input id="picture" type="file" />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="picture-after">Depois (Foto)</Label>
                  <Input id="picture-after" type="file" />
                </div>
                <Button>Enviar para Aprovação</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  )
}
