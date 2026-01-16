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
  Clock,
  Navigation,
} from 'lucide-react'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import useLanguageStore from '@/stores/useLanguageStore'

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
  const { t } = useLanguageStore()
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

  const arrivalEvidence = task.evidence?.find((e) => e.type === 'arrival')
  const completionEvidence = task.evidence?.find((e) => e.type === 'completion')
  const otherEvidence = task.evidence?.filter((e) => e.type === 'other') || []
  // Fallback for legacy images
  const legacyImages =
    task.images?.filter((img) => !task.evidence?.some((e) => e.url === img)) ||
    []

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
                <Badge variant="secondary">{t(`common.${task.status}`)}</Badge>
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
                  <MapPin className="h-4 w-4" /> {t('tasks.location')}
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

              {/* Workflow Evidence - NEW SECTION */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {t('tasks.activity_log')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Arrival Card */}
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="p-3 bg-muted/50 border-b flex items-center justify-between">
                      <span className="font-semibold text-xs uppercase tracking-wider text-blue-600">
                        {t('tasks.arrival')}
                      </span>
                      {arrivalEvidence && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <div className="p-0">
                      {arrivalEvidence ? (
                        <div className="flex flex-col">
                          <div className="relative aspect-video bg-black">
                            <img
                              src={arrivalEvidence.url}
                              alt="Arrival"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="p-3 text-xs space-y-1.5 bg-muted/10">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(
                                  new Date(arrivalEvidence.timestamp),
                                  'dd/MM/yyyy HH:mm',
                                )}
                              </span>
                            </div>
                            {arrivalEvidence.location && (
                              <div className="flex items-start gap-1.5 text-muted-foreground">
                                <Navigation className="h-3 w-3 mt-0.5 shrink-0" />
                                <span className="leading-tight">
                                  {arrivalEvidence.location.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 flex items-center justify-center text-xs text-muted-foreground italic bg-muted/10">
                          {t('common.pending')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Completion Card */}
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="p-3 bg-muted/50 border-b flex items-center justify-between">
                      <span className="font-semibold text-xs uppercase tracking-wider text-green-600">
                        {t('tasks.completion')}
                      </span>
                      {completionEvidence && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <div className="p-0">
                      {completionEvidence ? (
                        <div className="flex flex-col">
                          <div className="relative aspect-video bg-black">
                            <img
                              src={completionEvidence.url}
                              alt="Completion"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="p-3 text-xs space-y-1.5 bg-muted/10">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(
                                  new Date(completionEvidence.timestamp),
                                  'dd/MM/yyyy HH:mm',
                                )}
                              </span>
                            </div>
                            {completionEvidence.location && (
                              <div className="flex items-start gap-1.5 text-muted-foreground">
                                <Navigation className="h-3 w-3 mt-0.5 shrink-0" />
                                <span className="leading-tight">
                                  {completionEvidence.location.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 flex items-center justify-center text-xs text-muted-foreground italic bg-muted/10">
                          {t('common.pending')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Execution Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> {t('tasks.assignee')}
                  </h4>
                  <p className="font-medium">{task.assignee}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {t('tasks.scheduled_date')}
                  </h4>
                  <p className="font-medium">
                    {format(new Date(task.date), 'dd/MM/yyyy')}
                  </p>
                </div>
                {task.price && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />{' '}
                      {t('tasks.estimated_value')}
                    </h4>
                    <p className="font-medium">${task.price.toFixed(2)}</p>
                  </div>
                )}
                {task.backToBack && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {t('common.type')}
                    </h4>
                    <Badge variant="destructive">Back-to-Back</Badge>
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {t('common.description')}
                </h3>
                <p className="text-sm leading-relaxed">
                  {task.description || 'Sem descrição detalhada.'}
                </p>
              </div>

              {/* Additional Photos / Attachments */}
              {(legacyImages.length > 0 || otherEvidence.length > 0) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />{' '}
                    {t('tasks.additional_photos')}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {otherEvidence.map((ev, idx) => (
                      <div
                        key={ev.id}
                        className="relative aspect-video rounded-md overflow-hidden border bg-muted group"
                      >
                        <img
                          src={ev.url}
                          alt={`Evidence ${idx + 1}`}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {format(new Date(ev.timestamp), 'dd/MM HH:mm')}
                        </div>
                      </div>
                    ))}
                    {legacyImages.map((img, idx) => (
                      <div
                        key={`legacy-${idx}`}
                        className="relative aspect-video rounded-md overflow-hidden border bg-muted"
                      >
                        <img
                          src={img}
                          alt={`Legacy ${idx + 1}`}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
