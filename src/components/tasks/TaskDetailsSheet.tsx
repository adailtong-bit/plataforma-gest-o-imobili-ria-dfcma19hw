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
            {(task.price !== undefined || task.laborCost !== undefined) && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Financials</p>
                  {task.price !== undefined && (
                    <p className="text-sm text-slate-700">
                      Price: ${task.price}
                    </p>
                  )}
                  {task.laborCost !== undefined && (
                    <p className="text-sm text-slate-700">
                      Labor: ${task.laborCost}
                    </p>
                  )}
                  {task.materialCost !== undefined && (
                    <p className="text-sm text-slate-700">
                      Material: ${task.materialCost}
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
