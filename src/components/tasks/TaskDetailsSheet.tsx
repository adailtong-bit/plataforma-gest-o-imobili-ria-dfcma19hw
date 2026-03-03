import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Task } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { MapPin, User, Calendar, DollarSign, FileText } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import { formatCurrency } from '@/lib/utils'

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
  const { currentUser } = useAuthStore()

  if (!task) return null

  const role = currentUser?.role as string
  const isAdminOrPM = [
    'platform_owner',
    'software_tenant',
    'internal_user',
  ].includes(role)
  const isPartner = role === 'partner'
  const isTeamMember = role === 'partner_employee'
  const isOwner = role === 'property_owner'

  const showOwnerPrice = isAdminOrPM || isOwner
  const showPartnerPrice = isAdminOrPM || isPartner
  const showTeamMemberPayout = isAdminOrPM || isPartner || isTeamMember

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">{task.title}</SheetTitle>
          <SheetDescription>Task Details</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="uppercase text-xs">
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge variant="secondary" className="uppercase text-xs">
              {task.type}
            </Badge>
            <Badge className="uppercase text-xs">{task.priority}</Badge>
          </div>

          <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Property</p>
                <p className="text-sm text-slate-700">{task.propertyName}</p>
                {task.propertyAddress && (
                  <p className="text-xs text-slate-500">
                    {task.propertyAddress}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Assignee</p>
                <p className="text-sm text-slate-700">{task.assignee}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Scheduled Date</p>
                <p className="text-sm text-slate-700">
                  {format(new Date(task.date), 'PPP')}
                </p>
              </div>
            </div>

            {(showOwnerPrice || showPartnerPrice || showTeamMemberPayout) && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Financials</p>
                  {showOwnerPrice && task.price !== undefined && (
                    <p className="text-sm text-slate-700">
                      Owner Price: {formatCurrency(task.price)}
                    </p>
                  )}
                  {showPartnerPrice && task.laborCost !== undefined && (
                    <p className="text-sm text-slate-700">
                      Partner Price: {formatCurrency(task.laborCost)}
                    </p>
                  )}
                  {showTeamMemberPayout &&
                    task.teamMemberPayout !== undefined && (
                      <p className="text-sm text-slate-700">
                        Member Payout: {formatCurrency(task.teamMemberPayout)}
                      </p>
                    )}
                  {task.materialCost !== undefined && isAdminOrPM && (
                    <p className="text-sm text-slate-700">
                      Material Cost: {formatCurrency(task.materialCost)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {task.description && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Description</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {task.images && task.images.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3">Images</h4>
              <div className="grid grid-cols-2 gap-2">
                {task.images.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-md overflow-hidden border"
                  >
                    <img
                      src={img}
                      alt={`Task image ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
