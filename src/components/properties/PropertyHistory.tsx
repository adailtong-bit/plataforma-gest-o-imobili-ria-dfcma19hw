import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface Props {
  data: Property
}

export function PropertyHistory({ data }: Props) {
  const history = data.priceHistory || []
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>Histórico de Preços e Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((log, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Preço atualizado para ${log.price}
                  </p>
                  <p className="text-xs text-slate-500">
                    Alterado por: {log.changedBy || 'Sistema'}
                  </p>
                </div>
                <div className="text-sm text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded">
                  {format(new Date(log.date), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-lg bg-slate-50">
              Nenhum histórico disponível.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
