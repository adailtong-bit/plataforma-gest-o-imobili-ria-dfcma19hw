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

export default function Marketing() {
  const { campaigns } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.marketing')}
        </h1>
        <p className="text-muted-foreground">Manage marketing campaigns.</p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">
                  {t('common.status')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((camp) => (
                <TableRow key={camp.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {camp.name}
                  </TableCell>
                  <TableCell className="capitalize">
                    {camp.targetAudience}
                  </TableCell>
                  <TableCell>{camp.startDate}</TableCell>
                  <TableCell>{camp.endDate}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        camp.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {camp.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
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
