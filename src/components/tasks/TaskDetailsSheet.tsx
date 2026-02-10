import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/lib/types'
import { format } from 'date-fns'
import { DataMask } from '@/components/DataMask'
import { Separator } from '@/components/ui/separator'
import { MapPin, Calendar, User, Clock } from 'lucide-react'
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
  const { t, language } = useLanguageStore()

  if (!task) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <div className="flex justify-between items-start">
            <SheetTitle className="text-xl font-bold">
              <DataMask>{task.title}</DataMask>
            </SheetTitle>
            <Badge>{task.status}</Badge>
          </div>
          <SheetDescription>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-3 w-3" />{' '}
              <DataMask>{task.propertyName}</DataMask>
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase text-muted-foreground">
              {t('common.details')}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Scheduled
                </span>
                <span className="font-medium">
                  {format(new Date(task.date), 'PPP')}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Assignee
                </span>
                <span className="font-medium">
                  <DataMask>{task.assignee}</DataMask>
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Priority</span>
                <span className="capitalize">{task.priority}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">
                  {t(`partners.${task.type}`) || task.type}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase text-muted-foreground">
              {t('common.description')}
            </h4>
            <div className="bg-muted/30 p-3 rounded-md text-sm">
              <DataMask>
                {task.description || 'No description provided.'}
              </DataMask>
            </div>
          </div>

          {task.evidence && task.evidence.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase text-muted-foreground">
                  Evidence
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {task.evidence.map((ev, i) => (
                    <div
                      key={ev.id}
                      className="relative aspect-video rounded-md overflow-hidden border"
                    >
                      <img
                        src={ev.url}
                        alt={`Evidence ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <SheetFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
