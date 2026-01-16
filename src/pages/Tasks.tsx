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
import { Badge } from '@/components/ui/badge'
import { Clock, Plus, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useTaskStore from '@/stores/useTaskStore'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

export default function Tasks() {
  const { tasks, updateTaskStatus, addTaskImage } = useTaskStore()

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
                    onStatusChange={(status) =>
                      updateTaskStatus(task.id, status)
                    }
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
                    onStatusChange={(status) =>
                      updateTaskStatus(task.id, status)
                    }
                    onUpload={(img) => addTaskImage(task.id, img)}
                  />
                ))}
            </div>

            {/* Approval Column */}
            <div className="bg-muted/50 p-4 rounded-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase text-orange-600">
                  Aprovação
                </h3>
                <Badge className="bg-orange-100 text-orange-700">
                  {tasks.filter((t) => t.status === 'approved').length}
                </Badge>
              </div>
              {tasks
                .filter((t) => t.status === 'approved')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    priorityColor={getPriorityColor(task.priority)}
                    onStatusChange={(status) =>
                      updateTaskStatus(task.id, status)
                    }
                  />
                ))}
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
                    onStatusChange={(status) =>
                      updateTaskStatus(task.id, status)
                    }
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
  onStatusChange,
  onUpload,
}: {
  task: any
  priorityColor: string
  onStatusChange: (status: any) => void
  onUpload?: (img: string) => void
}) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)

  const handleUpload = () => {
    if (onUpload) {
      // Mock upload
      onUpload('https://img.usecurling.com/p/200/150?q=fix')
      toast({
        title: 'Foto enviada',
        description: 'Evidência adicionada à tarefa.',
      })
    }
  }

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
        <div className="flex gap-2 mt-3">
          {task.status === 'pending' && (
            <Button
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => onStatusChange('in_progress')}
            >
              Iniciar
            </Button>
          )}
          {task.status === 'in_progress' && (
            <Button
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => onStatusChange('completed')}
            >
              Concluir
            </Button>
          )}
        </div>
      </CardContent>
      {task.status === 'in_progress' && onUpload && (
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
                  <Label htmlFor="picture">Evidência (Foto)</Label>
                  <Input
                    id="picture"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button onClick={handleUpload}>Enviar para Tarefa</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  )
}
