import { useState } from 'react'
import { Task } from '@/lib/types'
import {
  Card,
  CardContent,
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
import { Clock, Upload, MapPin, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { TaskDetailsSheet } from './TaskDetailsSheet'

interface TaskCardProps {
  task: Task
  onStatusChange: (status: Task['status']) => void
  onUpload?: (taskId: string, img: string) => void
}

export function TaskCard({ task, onStatusChange, onUpload }: TaskCardProps) {
  const { toast } = useToast()
  const [detailsOpen, setDetailsOpen] = useState(false)
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
    <>
      <TaskDetailsSheet
        task={task}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <Card className="hover:shadow-md transition-shadow group flex flex-col h-full">
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex justify-between items-start">
            <Badge
              variant="outline"
              className={getPriorityColor(task.priority)}
            >
              {task.priority}
            </Badge>
            <div className="flex gap-1 flex-wrap justify-end">
              {task.type === 'cleaning' && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  Limpeza
                </Badge>
              )}
              {task.type === 'maintenance' && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  Reparo
                </Badge>
              )}
              {task.type === 'inspection' && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  Inspeção
                </Badge>
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
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div className="font-medium truncate">{task.propertyName}</div>
            {(task.propertyAddress || task.propertyCommunity) && (
              <div className="flex items-start gap-1 text-[10px] opacity-80">
                <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  {task.propertyCommunity ? `${task.propertyCommunity}, ` : ''}
                  {task.propertyAddress}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex-grow">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(task.date), 'dd/MM/yyyy')}</span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="text-xs font-medium bg-secondary px-2 py-1 rounded-full truncate max-w-[120px]">
              {task.assignee}
            </div>
            {task.images && task.images.length > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 gap-1">
                <Eye className="h-2 w-2" /> {task.images.length}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto grid gap-2">
          {task.status === 'pending' && (
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={() => onStatusChange('in_progress')}
            >
              Iniciar Serviço
            </Button>
          )}
          {task.status === 'in_progress' && (
            <div className="grid grid-cols-2 gap-2 w-full">
              {onUpload && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-xs h-8">
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
                      <Button onClick={handleUpload}>Enviar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                size="sm"
                className="text-xs h-8"
                onClick={() => onStatusChange('completed')}
              >
                Concluir
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs text-muted-foreground"
            onClick={() => setDetailsOpen(true)}
          >
            Ver Detalhes & Localização
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
