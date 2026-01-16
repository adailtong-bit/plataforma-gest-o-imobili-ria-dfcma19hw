import { useState } from 'react'
import { Task } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onStatusChange: (status: Task['status']) => void
  onUpload?: (taskId: string, img: string) => void
}

export function TaskCard({ task, onStatusChange, onUpload }: TaskCardProps) {
  const { toast } = useToast()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [file, setFile] = useState<File | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const handleUpload = () => {
    if (onUpload) {
      // Mock upload
      onUpload(task.id, 'https://img.usecurling.com/p/200/150?q=maintenance')
      toast({
        title: 'Foto enviada',
        description: 'Evidência adicionada à tarefa.',
      })
    }
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow group">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          <div className="flex gap-1">
            {task.type === 'cleaning' && (
              <Badge variant="secondary">Limpeza</Badge>
            )}
            {task.type === 'maintenance' && (
              <Badge variant="secondary">Reparo</Badge>
            )}
            {task.type === 'inspection' && (
              <Badge variant="secondary">Inspeção</Badge>
            )}
            {task.backToBack && (
              <Badge variant="destructive" className="text-[10px] px-1 h-5">
                B2B
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
          {task.title}
        </CardTitle>
        <CardDescription className="text-xs truncate">
          {task.propertyName}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Clock className="h-3 w-3" />
          <span>{format(new Date(task.date), 'dd/MM/yyyy')}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs font-medium bg-secondary px-2 py-1 rounded-full truncate max-w-[120px]">
            {task.assignee}
          </div>
          {task.price && (
            <span className="text-xs font-semibold text-muted-foreground">
              ${task.price}
            </span>
          )}
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {task.description}
          </p>
        )}
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
