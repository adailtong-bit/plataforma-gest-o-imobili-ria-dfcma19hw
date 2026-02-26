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

export default function Workflows() {
  const { workflows } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.workflows')}
        </h1>
        <p className="text-muted-foreground">
          Manage automated task workflows.
        </p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Workflow Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Steps Count</TableHead>
                <TableHead className="text-right">
                  {t('common.status')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((wf) => (
                <TableRow key={wf.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {wf.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {wf.trigger}
                  </TableCell>
                  <TableCell>{wf.steps.length}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={wf.active ? 'default' : 'secondary'}>
                      {wf.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {workflows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
