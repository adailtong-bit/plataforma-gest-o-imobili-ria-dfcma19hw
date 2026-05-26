import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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
import usePublicityStore from '@/stores/usePublicityStore'
import { format } from 'date-fns'

export default function PublicityAdmin() {
  const { t } = useLanguageStore()
  const { campaigns } = usePublicityStore()

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('publicity_admin.title', 'Ad Admin')}
        </h1>
        <p className="text-muted-foreground">
          {t(
            'publicity_admin.subtitle',
            'Manage global publicity campaigns and monitor performance.',
          )}
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>
            {t('publicity_admin.campaigns_title', 'Active Campaigns')}
          </CardTitle>
          <CardDescription>
            {t(
              'publicity_admin.campaigns_desc',
              'Track impressions, clicks, and status.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('publicity_admin.col_title', 'Title')}</TableHead>
                <TableHead>
                  {t('publicity_admin.col_status', 'Status')}
                </TableHead>
                <TableHead>
                  {t('publicity_admin.col_impressions', 'Impressions')}
                </TableHead>
                <TableHead>
                  {t('publicity_admin.col_clicks', 'Clicks')}
                </TableHead>
                <TableHead>
                  {t('publicity_admin.col_start', 'Start Date')}
                </TableHead>
                <TableHead>
                  {t('publicity_admin.col_end', 'End Date')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t('common.empty', 'No data found')}
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((camp) => (
                  <TableRow key={camp.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{camp.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          camp.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {t(`status.${camp.status}`, camp.status || 'unknown')}
                      </Badge>
                    </TableCell>
                    <TableCell>{camp.impressions_count || 0}</TableCell>
                    <TableCell>{camp.clicks_count || 0}</TableCell>
                    <TableCell>
                      {camp.start_date
                        ? format(new Date(camp.start_date), 'PP')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {camp.end_date
                        ? format(new Date(camp.end_date), 'PP')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
