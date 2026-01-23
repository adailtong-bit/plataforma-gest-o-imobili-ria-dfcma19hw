import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Trash2, Edit } from 'lucide-react'
import usePartnerStore from '@/stores/usePartnerStore'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ServiceRate } from '@/lib/types'

export function ServiceCatalog() {
  const {
    partners,
    updatePartner,
    genericServiceRates,
    addGenericServiceRate,
    updateGenericServiceRate,
    deleteGenericServiceRate,
  } = usePartnerStore()
  const { toast } = useToast()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('generic')

  const [currentRate, setCurrentRate] = useState<Partial<ServiceRate>>({
    serviceName: '',
    servicePrice: 0,
    partnerPayment: 0,
    pmValue: 0,
    productPrice: 0,
    validFrom: format(new Date(), 'yyyy-MM-dd'),
    validTo: '',
    type: 'generic',
  })

  // Auto-calculate PM Value based on Service Price and Partner Payment if not manually set recently
  // For now, let's keep it simple: manual input for all to ensure accuracy as per user story.
  // "Implement logic to ensure the relationship... is consistent"
  // Let's add listeners to update pmValue if servicePrice and partnerPayment are set.
  const handlePriceChange = (
    field: keyof ServiceRate,
    val: string | number,
  ) => {
    const numVal = Number(val)
    const newRate = { ...currentRate, [field]: numVal }

    if (field === 'servicePrice' || field === 'partnerPayment') {
      const sp =
        field === 'servicePrice' ? numVal : Number(currentRate.servicePrice)
      const pp =
        field === 'partnerPayment' ? numVal : Number(currentRate.partnerPayment)
      // Recalculate PM Value
      newRate.pmValue = sp - pp
    }

    setCurrentRate(newRate)
  }

  // Flatten all service rates including generic
  const partnerRates = partners.flatMap((partner) =>
    (partner.serviceRates || []).map((rate) => ({
      ...rate,
      partnerName: partner.name,
      partnerId: partner.id,
      partnerType: partner.type,
      isGeneric: false,
    })),
  )

  const genericRatesFormatted = genericServiceRates.map((rate) => ({
    ...rate,
    partnerName: 'Genérico (Todos)',
    partnerId: 'generic',
    partnerType: 'System',
    isGeneric: true,
  }))

  const allRates = [...genericRatesFormatted, ...partnerRates]

  const filteredRates = allRates.filter(
    (rate) =>
      rate.serviceName.toLowerCase().includes(filter.toLowerCase()) ||
      rate.partnerName.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleSave = () => {
    if (!currentRate.serviceName || !currentRate.servicePrice) {
      toast({
        title: 'Erro',
        description: 'Nome e Preço do Serviço são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    const rateData: ServiceRate = {
      id: currentRate.id || `rate-${Date.now()}`,
      serviceName: currentRate.serviceName,
      servicePrice: Number(currentRate.servicePrice || 0),
      partnerPayment: Number(currentRate.partnerPayment || 0),
      pmValue: Number(currentRate.pmValue || 0),
      productPrice: Number(currentRate.productPrice || 0),
      validFrom:
        currentRate.validFrom?.toString() || format(new Date(), 'yyyy-MM-dd'),
      validTo: currentRate.validTo?.toString(),
      type: selectedPartnerId === 'generic' ? 'generic' : 'specific',
    }

    if (selectedPartnerId === 'generic') {
      if (editMode && currentRate.id) {
        updateGenericServiceRate(rateData)
      } else {
        addGenericServiceRate(rateData)
      }
    } else {
      const partner = partners.find((p) => p.id === selectedPartnerId)
      if (!partner) return

      let updatedRates = partner.serviceRates ? [...partner.serviceRates] : []

      if (editMode && currentRate.id) {
        updatedRates = updatedRates.map((r) =>
          r.id === currentRate.id ? rateData : r,
        )
      } else {
        updatedRates.push(rateData)
      }

      updatePartner({ ...partner, serviceRates: updatedRates })
    }

    toast({
      title: 'Sucesso',
      description: editMode
        ? 'Serviço atualizado.'
        : 'Serviço adicionado ao catálogo.',
    })

    setOpen(false)
    resetForm()
  }

  const handleDelete = (partnerId: string, rateId: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      if (partnerId === 'generic') {
        deleteGenericServiceRate(rateId)
      } else {
        const partner = partners.find((p) => p.id === partnerId)
        if (!partner) return

        const updatedRates = (partner.serviceRates || []).filter(
          (r) => r.id !== rateId,
        )
        updatePartner({ ...partner, serviceRates: updatedRates })
      }

      toast({
        title: 'Excluído',
        description: 'Serviço removido do catálogo.',
      })
    }
  }

  const openAdd = () => {
    setEditMode(false)
    resetForm()
    setOpen(true)
  }

  const openEdit = (rate: any) => {
    setEditMode(true)
    setSelectedPartnerId(rate.partnerId)
    setCurrentRate({
      id: rate.id,
      serviceName: rate.serviceName,
      servicePrice: rate.servicePrice,
      partnerPayment: rate.partnerPayment,
      pmValue: rate.pmValue,
      productPrice: rate.productPrice,
      validFrom: rate.validFrom,
      validTo: rate.validTo || '',
      type: rate.type,
    })
    setOpen(true)
  }

  const resetForm = () => {
    setSelectedPartnerId('generic')
    setCurrentRate({
      serviceName: '',
      servicePrice: 0,
      partnerPayment: 0,
      pmValue: 0,
      productPrice: 0,
      validFrom: format(new Date(), 'yyyy-MM-dd'),
      validTo: '',
      type: 'generic',
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Catálogo de Preços de Serviços</CardTitle>
            <CardDescription>
              Gerencie custos, pagamentos a parceiros e margens de PM para
              automação financeira.
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="bg-trust-blue">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>
                  {editMode ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Parceiro / Fornecedor</Label>
                    <Select
                      value={selectedPartnerId}
                      onValueChange={setSelectedPartnerId}
                      disabled={editMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generic">
                          Genérico (Todos os Parceiros)
                        </SelectItem>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Nome do Serviço</Label>
                    <Input
                      value={currentRate.serviceName}
                      onChange={(e) =>
                        setCurrentRate({
                          ...currentRate,
                          serviceName: e.target.value,
                        })
                      }
                      placeholder="Ex: Limpeza Padrão 2 Quartos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
                  <div className="grid gap-2">
                    <Label className="text-xs">
                      Service Price (Total Labor)
                    </Label>
                    <Input
                      type="number"
                      value={currentRate.servicePrice}
                      onChange={(e) =>
                        handlePriceChange('servicePrice', e.target.value)
                      }
                      placeholder="0.00"
                      className="font-bold"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs text-muted-foreground">
                      Partner Payment (Cost)
                    </Label>
                    <Input
                      type="number"
                      value={currentRate.partnerPayment}
                      onChange={(e) =>
                        handlePriceChange('partnerPayment', e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs text-muted-foreground">
                      PM Value (Margin)
                    </Label>
                    <Input
                      type="number"
                      value={currentRate.pmValue}
                      onChange={(e) =>
                        setCurrentRate({
                          ...currentRate,
                          pmValue: Number(e.target.value),
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Product Price (Material)</Label>
                    <Input
                      type="number"
                      value={currentRate.productPrice}
                      onChange={(e) =>
                        setCurrentRate({
                          ...currentRate,
                          productPrice: Number(e.target.value),
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  PM Value é calculado automaticamente como (Service Price -
                  Partner Payment), mas pode ser ajustado.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Início Validade</Label>
                    <Input
                      type="date"
                      value={
                        currentRate.validFrom
                          ? format(
                              new Date(currentRate.validFrom),
                              'yyyy-MM-dd',
                            )
                          : ''
                      }
                      onChange={(e) =>
                        setCurrentRate({
                          ...currentRate,
                          validFrom: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Fim Validade (Opcional)</Label>
                    <Input
                      type="date"
                      value={
                        currentRate.validTo
                          ? format(new Date(currentRate.validTo), 'yyyy-MM-dd')
                          : ''
                      }
                      onChange={(e) =>
                        setCurrentRate({
                          ...currentRate,
                          validTo: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviço ou parceiro..."
              className="pl-8"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Service Price</TableHead>
                <TableHead>Product Price</TableHead>
                <TableHead>Partner Pay</TableHead>
                <TableHead>PM Value</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum serviço encontrado no catálogo.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRates.map((rate) => (
                  <TableRow key={`${rate.partnerId}-${rate.id}`}>
                    <TableCell className="font-medium">
                      {rate.serviceName}
                    </TableCell>
                    <TableCell>
                      {rate.isGeneric ? (
                        <Badge variant="secondary">Genérico</Badge>
                      ) : (
                        rate.partnerName
                      )}
                    </TableCell>
                    <TableCell className="font-bold">
                      ${rate.servicePrice?.toFixed(2)}
                    </TableCell>
                    <TableCell>${rate.productPrice?.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      ${rate.partnerPayment?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ${rate.pmValue?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(rate)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(rate.partnerId, rate.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
