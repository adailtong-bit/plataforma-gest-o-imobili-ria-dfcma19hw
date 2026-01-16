import { Task } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  MapPin,
  User,
  Building,
  Image as ImageIcon,
  DollarSign,
  CheckCircle2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface TaskDetailsSheetProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailsSheet({
  task,
  open,
  onOpenChange,
}: TaskDetailsSheetProps) {
  if (!task) return null

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

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'in_progress':
        return 'Em Andamento'
      case 'approved':
        return 'Aguardando Aprovação'
      case 'completed':
        return 'Concluído'
      default:
        return status
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={getPriorityColor(task.priority)}
                >
                  {task.priority.toUpperCase()}
                </Badge>
                <Badge variant="secondary">{getStatusLabel(task.status)}</Badge>
              </div>
              <SheetTitle className="text-2xl">{task.title}</SheetTitle>
              <SheetDescription className="text-base">
                {task.propertyName}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Location Section */}
              <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                  <MapPin className="h-4 w-4" /> Localização
                </h3>
                <div className="grid gap-2">
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium block">
                        {task.propertyCommunity || 'Condomínio não informado'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Comunidade
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium block">
                        {task.propertyAddress || 'Endereço não informado'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Endereço Completo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Execution Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Responsável
                  </h4>
                  <p className="font-medium">{task.assignee}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Data Agendada
                  </h4>
                  <p className="font-medium">
                    {format(new Date(task.date), 'dd/MM/yyyy')}
                  </p>
                </div>
                {task.price && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Valor Estimado
                    </h4>
                    <p className="font-medium">${task.price.toFixed(2)}</p>
                  </div>
                )}
                {task.backToBack && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Tipo
                    </h4>
                    <Badge variant="destructive">Back-to-Back</Badge>
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Descrição
                </h3>
                <p className="text-sm leading-relaxed">
                  {task.description || 'Sem descrição detalhada.'}
                </p>
              </div>

              {/* Photos / Attachments */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Fotos & Referências Visuais
                </h3>
                {task.images && task.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {task.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-md overflow-hidden border bg-muted"
                      >
                        <img
                          src={img}
                          alt={`Evidência ${idx + 1}`}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic p-4 bg-muted/30 rounded-md text-center">
                    Nenhuma foto anexada.
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
