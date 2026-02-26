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
import useLanguageStore from '@/stores/useLanguageStore'

export default function Condominiums() {
  const { condominiums } = useContext(AppContext)!
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.condominiums')}
        </h1>
        <p className="text-muted-foreground">
          Manage your properties' condominiums.
        </p>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.address')}</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Manager Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {condominiums.map((condo) => (
                <TableRow key={condo.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {condo.name}
                  </TableCell>
                  <TableCell>{condo.address}</TableCell>
                  <TableCell>{condo.city}</TableCell>
                  <TableCell>{condo.managerEmail}</TableCell>
                </TableRow>
              ))}
              {condominiums.length === 0 && (
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
