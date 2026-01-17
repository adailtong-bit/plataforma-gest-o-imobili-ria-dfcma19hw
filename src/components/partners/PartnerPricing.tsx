import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { Partner, ServiceRate } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import useLanguageStore from '@/stores/useLanguageStore'

interface PartnerPricingProps {
  partner: Partner
  onUpdate: (partner: Partner) => void
  canEdit: boolean
}

export function PartnerPricing({
  partner,
  onUpdate,
  canEdit,
}: PartnerPricingProps) {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [newRate, setNewRate] = useState<Partial<ServiceRate>>({
    serviceName: '',
    price: 0,
    validFrom: format(new Date(), 'yyyy-MM-dd'),
  })

  const handleAddRate = () => {
    if (newRate.serviceName && newRate.price) {
      const rate: ServiceRate = {
        id: `rate-${Date.now()}`,
        serviceName: newRate.serviceName,
        price: Number(newRate.price),
        validFrom: newRate.validFrom!,
        type: 'specific',
      }
      onUpdate({
        ...partner,
        serviceRates: [...(partner.serviceRates || []), rate],
      })
      setNewRate({
        serviceName: '',
        price: 0,
        validFrom: format(new Date(), 'yyyy-MM-dd'),
      })
      toast({
        title: 'Sucesso',
        description: 'Serviço adicionado à tabela de preços.',
      })
    }
  }

  const removeRate = (rateId: string) => {
    if (confirm('Remover este item da tabela de preços?')) {
      onUpdate({
        ...partner,
        serviceRates: partner.serviceRates?.filter((r) => r.id !== rateId),
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('partners.service_rates')}</CardTitle>
      </CardHeader>
      <CardContent>
        {canEdit && (
          <div className="flex flex-col md:flex-row gap-2 mb-6 items-end border p-4 rounded-md bg-muted/20">
            <div className="grid gap-2 flex-1 w-full">
              <Label>{t('partners.rate_name')}</Label>
              <Input
                value={newRate.serviceName}
                onChange={(e) =>
                  setNewRate({ ...newRate, serviceName: e.target.value })
                }
                placeholder="Ex: Limpeza Padrão"
              />
            </div>
            <div className="grid gap-2 w-full md:w-32">
              <Label>{t('partners.rate_price')}</Label>
              <Input
                type="number"
                value={newRate.price}
                onChange={(e) =>
                  setNewRate({ ...newRate, price: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2 w-full md:w-40">
              <Label>{t('partners.rate_valid_from')}</Label>
              <Input
                type="date"
                value={newRate.validFrom}
                onChange={(e) =>
                  setNewRate({ ...newRate, validFrom: e.target.value })
                }
              />
            </div>
            <Button
              onClick={handleAddRate}
              className="bg-trust-blue w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" /> {t('common.add_title')}
            </Button>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Validade</TableHead>
              {canEdit && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!partner.serviceRates || partner.serviceRates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum serviço cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              partner.serviceRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">
                    {rate.serviceName}
                  </TableCell>
                  <TableCell>${rate.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {format(new Date(rate.validFrom), 'dd/MM/yyyy')}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeRate(rate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
