import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'

export default function Housekeeping() {
  const { tasks } = useContext(AppContext)!
  const { t } = useLanguageStore()

  const housekeepingTasks = tasks.filter((task) => task.type === 'cleaning')

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('housekeeping.title')}
        </h1>
        <p className="text-muted-foreground">{t('housekeeping.subtitle')}</p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('housekeeping.task_title')}</TableHead>
                <TableHead>{t('common.property')}</TableHead>
                <TableHead>{t('housekeeping.assignee')}</TableHead>
                <TableHead>{t('housekeeping.date')}</TableHead>
                <TableHead className="text-right">
                  {t('common.status')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {housekeepingTasks.slice(0, 50).map((task) => (
                <TableRow key={task.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {task.title}
                  </TableCell>
                  <TableCell>{task.propertyName}</TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>
                    {format(new Date(task.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        task.status === 'completed' ? 'default' : 'secondary'
                      }
                    >
                      {t(`status.${task.status}`) ||
                        task.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {housekeepingTasks.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
