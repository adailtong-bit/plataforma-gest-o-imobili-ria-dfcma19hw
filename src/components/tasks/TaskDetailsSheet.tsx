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
  Briefcase,
  ExternalLink,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import useLanguageStore from '@/stores/useLanguageStore'
import useShortTermStore from '@/stores/useShortTermStore'
import { Card, CardContent } from '@/components/ui/card'

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
  const { bookings } = useShortTermStore()

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
  const completionEvidence =
    task.evidence?.filter((e) => e.type === 'completion') || []
  const otherEvidence = task.evidence?.filter((e) => e.type === 'other') || []

  // Combine legacy images and completion photos for gallery
  const galleryImages = [
    ...completionEvidence.map((e) => ({
      url: e.url,
      type: 'Completion',
      date: e.timestamp,
    })),
    ...otherEvidence.map((e) => ({
      url: e.url,
      type: 'Update',
      date: e.timestamp,
    })),
    ...(task.images?.map((url) => ({
      url,
      type: 'Reference',
      date: task.date,
    })) || []),
  ]

  // Filter out duplicates if evidence url is same as image url
  const uniqueGallery = galleryImages.filter(
    (img, index, self) => index === self.findIndex((t) => t.url === img.url),
  )

  const linkedBooking = task.bookingId
    ? bookings.find((b) => b.id === task.bookingId)
    : null

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
                {linkedBooking && (
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">
                    <Briefcase className="w-3 h-3 mr-1" /> Booking Linked
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-2xl">{task.title}</SheetTitle>
              <SheetDescription className="text-base">
                {task.propertyName}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Booking Link Section */}
              {linkedBooking && (
                <Card className="bg-purple-50/50 border-purple-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-purple-800 font-semibold text-sm uppercase tracking-wide">
                      <Briefcase className="h-4 w-4" /> {t('short_term.title')}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">
                          {t('short_term.guest')}
                        </span>
                        <p className="font-medium">{linkedBooking.guestName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          {t('short_term.platform')}
                        </span>
                        <p className="capitalize">{linkedBooking.platform}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Check-in
                        </span>
                        <p className="font-medium">
                          {format(
                            parseISO(linkedBooking.checkIn),
                            'dd/MM/yyyy',
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Check-out
                        </span>
                        <p className="font-medium">
                          {format(
                            parseISO(linkedBooking.checkOut),
                            'dd/MM/yyyy',
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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

              {/* Workflow Evidence */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {t('tasks.activity_log')}
                </h3>

                {/* Arrival Status */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden mb-4">
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
                      <div className="h-20 flex items-center justify-center text-xs text-muted-foreground italic bg-muted/10">
                        {t('common.pending')} - Check-in não realizado
                      </div>
                    )}
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
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {task.description || 'Sem descrição detalhada.'}
                </p>
              </div>

              {/* Gallery */}
              {uniqueGallery.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Galeria de Fotos
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {uniqueGallery.map((img, idx) => (
                      <div
                        key={`gallery-${idx}`}
                        className="relative aspect-video rounded-md overflow-hidden border bg-muted group"
                      >
                        <img
                          src={img.url}
                          alt={`Gallery ${idx + 1}`}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <div className="text-[10px] text-white w-full">
                            <p className="font-semibold">{img.type}</p>
                            <p className="truncate opacity-80">
                              {format(new Date(img.date), 'dd/MM HH:mm')}
                            </p>
                          </div>
                        </div>
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
