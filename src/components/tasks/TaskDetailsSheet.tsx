import { Task } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  MapPin,
  User,
  Building,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Navigation,
  Briefcase,
  Star,
  Receipt,
  Hammer,
  HardHat,
  AlertTriangle,
  Check,
  X,
  XCircle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import useLanguageStore from '@/stores/useLanguageStore'
import useShortTermStore from '@/stores/useShortTermStore'
import useAuthStore from '@/stores/useAuthStore'
import useTaskStore from '@/stores/useTaskStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { Card, CardContent } from '@/components/ui/card'
import { DataMask } from '@/components/DataMask'
import { useToast } from '@/hooks/use-toast'

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
  const { currentUser } = useAuthStore()
  const { updateTask } = useTaskStore()
  const { properties } = usePropertyStore()
  const { toast } = useToast()

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

  const uniqueGallery = galleryImages.filter(
    (img, index, self) => index === self.findIndex((t) => t.url === img.url),
  )

  const linkedBooking = task.bookingId
    ? bookings.find((b) => b.id === task.bookingId)
    : null

  const isAdminOrPM = [
    'platform_owner',
    'software_tenant',
    'internal_user',
  ].includes(currentUser.role)
  const isPartner = currentUser.role === 'partner'
  const isTeamMember = currentUser.role === 'partner_employee'
  const isOwner = currentUser.role === 'property_owner'

  // Financial Visibility Logic
  const showBillableToOwner = isAdminOrPM || isOwner
  const showInternalCosts = isAdminOrPM
  const showPartnerRevenue = isPartner
  const showTeamPayout = isAdminOrPM || isPartner || isTeamMember

  const handleApprove = () => {
    if (task.approvalStatus === 'owner_pending') {
      updateTask({
        ...task,
        approvalStatus: 'pm_pending',
      })
      toast({
        title: t('common.approved'),
        description: 'Aprovado. Aguardando PM.',
      })
    } else {
      updateTask({
        ...task,
        approvalStatus: 'approved',
        status: 'pending',
      })
      toast({
        title: t('common.approved'),
        description: 'Tarefa aprovada.',
      })
    }
  }

  const handleReject = () => {
    updateTask({
      ...task,
      status: 'pending',
      approvalStatus: undefined,
    })
    toast({
      title: t('common.reject'),
      description: 'Tarefa rejeitada.',
      variant: 'destructive',
    })
  }

  const property = properties.find((p) => p.id === task.propertyId)
  const isMyProperty = property?.ownerId === currentUser.id

  const canApprove =
    task.status === 'pending_approval' &&
    ((task.approvalStatus === 'owner_pending' && isOwner && isMyProperty) ||
      (task.approvalStatus === 'owner_pending' && isAdminOrPM) || // PM Super Approval
      (task.approvalStatus === 'pm_pending' && isAdminOrPM))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col h-full">
        <div className="p-6 pb-2">
          <SheetHeader>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              {task.approvalStatus && (
                <Badge
                  variant="outline"
                  className={
                    task.approvalStatus === 'approved'
                      ? 'text-green-700 bg-green-50 border-green-200'
                      : task.approvalStatus === 'owner_pending'
                        ? 'text-orange-700 bg-orange-50 border-orange-200'
                        : 'text-yellow-700 bg-yellow-50 border-yellow-200'
                  }
                >
                  {task.approvalStatus === 'approved' ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  {task.approvalStatus === 'owner_pending'
                    ? t('tasks.status_wait_owner')
                    : task.approvalStatus === 'pm_pending'
                      ? t('tasks.status_wait_pm')
                      : 'Approved'}
                </Badge>
              )}
            </div>
            <SheetTitle className="text-2xl">
              <DataMask>{task.title}</DataMask>
            </SheetTitle>
            <SheetDescription className="text-base">
              <DataMask>{task.propertyName}</DataMask>
            </SheetDescription>
          </SheetHeader>

          {/* Action Buttons in Drawer */}
          {canApprove && (
            <div className="flex gap-2 mt-4">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                onClick={handleApprove}
              >
                <Check className="h-4 w-4 mr-2" />
                {t('common.approve')}
              </Button>
              <Button
                variant="destructive"
                className="flex-1 font-bold"
                onClick={handleReject}
              >
                <X className="h-4 w-4 mr-2" />
                {t('common.reject')}
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-6 pb-6">
            {(showBillableToOwner ||
              showInternalCosts ||
              showPartnerRevenue ||
              showTeamPayout) && (
              <Card className="bg-emerald-50/50 border-emerald-100">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm uppercase tracking-wide">
                    <Receipt className="h-4 w-4" /> Detalhes Financeiros
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Owner View */}
                    {showBillableToOwner && (
                      <div className="col-span-2 md:col-span-1">
                        <span className="text-muted-foreground text-xs block">
                          Valor Total Faturado
                        </span>
                        <span className="text-xl font-bold text-emerald-700">
                          <DataMask>
                            $
                            {(task.billableAmount || task.price || 0).toFixed(
                              2,
                            )}
                          </DataMask>
                        </span>
                      </div>
                    )}

                    {/* PM View */}
                    {showInternalCosts && (
                      <>
                        <div className="col-span-2 md:col-span-1">
                          <span className="text-muted-foreground text-xs block flex items-center gap-1">
                            <Hammer className="h-3 w-3" /> Custo Mão de Obra
                          </span>
                          <span className="font-medium text-gray-700">
                            <DataMask>
                              ${(task.laborCost || task.price || 0).toFixed(2)}
                            </DataMask>
                          </span>
                        </div>
                        {task.materialCost && task.materialCost > 0 && (
                          <div className="col-span-2 md:col-span-1">
                            <span className="text-muted-foreground text-xs block flex items-center gap-1">
                              <HardHat className="h-3 w-3" /> Custo Material
                            </span>
                            <span className="font-medium text-gray-700">
                              <DataMask>
                                ${task.materialCost.toFixed(2)}
                              </DataMask>
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Partner View */}
                    {showPartnerRevenue && (
                      <div className="col-span-2 md:col-span-1">
                        <span className="text-muted-foreground text-xs block flex items-center gap-1">
                          <Hammer className="h-3 w-3" /> Receita (Partner)
                        </span>
                        <span className="font-medium text-gray-700">
                          <DataMask>${(task.price || 0).toFixed(2)}</DataMask>
                        </span>
                      </div>
                    )}

                    {/* Team/PM/Partner View */}
                    {showTeamPayout && task.teamMemberPayout && (
                      <div className="col-span-2 md:col-span-1">
                        <span className="text-muted-foreground text-xs block flex items-center gap-1">
                          <User className="h-3 w-3" /> Valor Pago à Equipe
                        </span>
                        <span className="font-medium text-blue-600">
                          <DataMask>
                            ${task.teamMemberPayout.toFixed(2)}
                          </DataMask>
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {task.rating && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-bold text-lg">{task.rating}/5</span>
                  <span className="text-sm text-yellow-700 font-medium">
                    Avaliação do Cliente
                  </span>
                </div>
                {task.feedback && (
                  <p className="text-sm text-yellow-800 italic">
                    "{task.feedback}"
                  </p>
                )}
              </div>
            )}

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
                      <p className="font-medium">
                        <DataMask>{linkedBooking.guestName}</DataMask>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        {t('short_term.platform')}
                      </span>
                      <p className="capitalize">
                        <DataMask>{linkedBooking.platform}</DataMask>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Check-in
                      </span>
                      <p className="font-medium">
                        {format(parseISO(linkedBooking.checkIn), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Check-out
                      </span>
                      <p className="font-medium">
                        {format(parseISO(linkedBooking.checkOut), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <MapPin className="h-4 w-4" /> {t('tasks.location')}
              </h3>
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium block">
                      <DataMask>
                        {task.propertyCommunity || 'Condomínio não informado'}
                      </DataMask>
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
                      <DataMask>
                        {task.propertyAddress || 'Endereço não informado'}
                      </DataMask>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Endereço Completo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> {t('tasks.activity_log')}
              </h3>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> {t('tasks.assignee')}
                </h4>
                <p className="font-medium">
                  <DataMask>{task.assignee}</DataMask>
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {t('tasks.scheduled_date')}
                </h4>
                <p className="font-medium">
                  {format(new Date(task.date), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {t('common.description')}
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {task.description || 'Sem descrição detalhada.'}
              </p>
            </div>

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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
