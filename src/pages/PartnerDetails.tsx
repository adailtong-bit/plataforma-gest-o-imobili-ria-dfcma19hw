import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import usePartnerStore from '@/stores/usePartnerStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { Partner, ServiceRate } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FileUpload } from '@/components/ui/file-upload'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

export default function PartnerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { partners, updatePartner } = usePartnerStore()
  const { ledgerEntries } = useFinancialStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const partner = partners.find((p) => p.id === id)

  const [formData, setFormData] = useState<Partner | null>(() =>
    partner ? JSON.parse(JSON.stringify(partner)) : null,
  )

  const [newRate, setNewRate] = useState<Partial<ServiceRate>>({
    serviceName: '',
    price: 0,
    validFrom: format(new Date(), 'yyyy-MM-dd'),
  })

  if (!partner || !formData) return <div>Not Found</div>

  const handleSave = () => {
    updatePartner(formData)
    toast({ title: t('common.save'), description: 'Partner updated' })
  }

  const handleDelete = () => {
    // Logic to delete partner
    toast({ title: 'Deleted', description: 'Partner deleted' })
    navigate('/partners')
  }

  const handleAddRate = () => {
    if (newRate.serviceName && newRate.price) {
      const rate: ServiceRate = {
        id: `rate-${Date.now()}`,
        serviceName: newRate.serviceName,
        price: Number(newRate.price),
        validFrom: newRate.validFrom!,
      }
      setFormData({
        ...formData,
        serviceRates: [...(formData.serviceRates || []), rate],
      })
      setNewRate({
        serviceName: '',
        price: 0,
        validFrom: format(new Date(), 'yyyy-MM-dd'),
      })
    }
  }

  const removeRate = (rateId: string) => {
    setFormData({
      ...formData,
      serviceRates: formData.serviceRates?.filter((r) => r.id !== rateId),
    })
  }

  // Financial Report
  const partnerEntries = ledgerEntries.filter((e) => e.beneficiaryId === id)
  const totalPaid = partnerEntries
    .filter((e) => e.status === 'cleared')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const totalPending = partnerEntries
    .filter((e) => e.status === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/partners">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              {formData.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formData.companyName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave} className="bg-trust-blue gap-2">
            <Save className="h-4 w-4" /> {t('common.save')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('properties.overview')}</TabsTrigger>
          <TabsTrigger value="rates">{t('partners.service_rates')}</TabsTrigger>
          <TabsTrigger value="financial">
            {t('partners.financial_report')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Detalhes do Parceiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('common.name')}</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('partners.company_name')}</Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('common.email')}</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('common.phone')}</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label>{t('common.address')}</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">
                    {t('partners.bank_info')}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('partners.bank_name')}</Label>
                      <Input
                        value={formData.paymentInfo?.bankName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentInfo: {
                              ...formData.paymentInfo!,
                              bankName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('partners.routing')}</Label>
                      <Input
                        value={formData.paymentInfo?.routingNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentInfo: {
                              ...formData.paymentInfo!,
                              routingNumber: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('partners.account')}</Label>
                      <Input
                        value={formData.paymentInfo?.accountNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentInfo: {
                              ...formData.paymentInfo!,
                              accountNumber: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  value={formData.avatar}
                  onChange={(url) => setFormData({ ...formData, avatar: url })}
                  label="Upload Avatar"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('partners.service_rates')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6 items-end border p-4 rounded-md bg-muted/20">
                <div className="grid gap-2 flex-1">
                  <Label>{t('partners.rate_name')}</Label>
                  <Input
                    value={newRate.serviceName}
                    onChange={(e) =>
                      setNewRate({ ...newRate, serviceName: e.target.value })
                    }
                    placeholder="Ex: Limpeza Padrão"
                  />
                </div>
                <div className="grid gap-2 w-32">
                  <Label>{t('partners.rate_price')}</Label>
                  <Input
                    type="number"
                    value={newRate.price}
                    onChange={(e) =>
                      setNewRate({ ...newRate, price: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2 w-40">
                  <Label>{t('partners.rate_valid_from')}</Label>
                  <Input
                    type="date"
                    value={newRate.validFrom}
                    onChange={(e) =>
                      setNewRate({ ...newRate, validFrom: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleAddRate}>
                  <Plus className="h-4 w-4 mr-2" /> {t('common.add_title')}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.serviceRates?.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.serviceName}</TableCell>
                      <TableCell>${rate.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {format(new Date(rate.validFrom), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => removeRate(rate.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${totalPaid.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ${totalPending.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('partners.payment_history')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnerEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {format(new Date(entry.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.category}</TableCell>
                      <TableCell>${entry.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`capitalize ${
                            entry.status === 'cleared'
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
