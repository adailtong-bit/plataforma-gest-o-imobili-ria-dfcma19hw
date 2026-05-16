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

export default function Automation() {
  const { automationRules } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.automation_rules') || 'Automation Rules'}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.automation_desc') ||
            'Configure system automation rules.'}
        </p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.type') || 'Rule Type'}</TableHead>
                <TableHead>{t('common.description') || 'Conditions'}</TableHead>
                <TableHead className="text-right">
                  {t('common.status') || 'Status'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automationRules.map((rule) => (
                <TableRow key={rule.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {rule.type.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {rule.threshold ? `Threshold: ${rule.threshold}` : ''}
                    {rule.daysBefore ? `Days Before: ${rule.daysBefore}` : ''}
                    {rule.event ? `Event: ${rule.event}` : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                      {rule.enabled
                        ? t('common.active') || 'Enabled'
                        : t('common.inactive') || 'Disabled'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {automationRules.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty') || 'No records found.'}
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
