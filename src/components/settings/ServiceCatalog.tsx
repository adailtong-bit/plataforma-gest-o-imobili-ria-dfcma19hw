import { useState } from 'react'
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
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('generic') // 'generic' or partner ID

  const [currentRate, setCurrentRate] = useState<Partial<ServiceRate>>({
    serviceName: '',
    price: 0,
    validFrom: format(new Date(), 'yyyy-MM-dd'),
    validTo: '',
    type: 'generic',
  })

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
    if (!currentRate.serviceName || !currentRate.price) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    if (selectedPartnerId === 'generic') {
      const rateData: ServiceRate = {
        id: currentRate.id || `gen-rate-${Date.now()}`,
        serviceName: currentRate.serviceName,
        price: Number(currentRate.price),
        validFrom: currentRate.validFrom || new Date().toISOString(),
        validTo: currentRate.validTo,
        type: 'generic',
      }

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
          r.id === currentRate.id ? (currentRate as ServiceRate) : r,
        )
      } else {
        updatedRates.push({
          id: `rate-${Date.now()}`,
          serviceName: currentRate.serviceName,
          price: Number(currentRate.price),
          validFrom: currentRate.validFrom || new Date().toISOString(),
          validTo: currentRate.validTo,
          type: 'specific',
        } as ServiceRate)
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
      price: rate.price,
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
      price: 0,
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
              Gerencie e visualize todos os serviços e tarifas dos parceiros.
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="bg-trust-blue">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editMode ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Tipo de Precificação</Label>
                  <Select
                    value={selectedPartnerId}
                    onValueChange={setSelectedPartnerId}
                    disabled={editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
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
                    placeholder="Ex: Limpeza Padrão"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Preço ($)</Label>
                    <Input
                      type="number"
                      value={currentRate.price}
                      onChange={(e) =>
                        setCurrentRate({
                          ...currentRate,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Validade (Início)</Label>
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
                    <Label>Validade (Fim)</Label>
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

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {rate.partnerType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      ${rate.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>
                          De:{' '}
                          {rate.validFrom
                            ? format(new Date(rate.validFrom), 'dd/MM/yyyy')
                            : '-'}
                        </span>
                        <span>
                          Até:{' '}
                          {rate.validTo
                            ? format(new Date(rate.validTo), 'dd/MM/yyyy')
                            : 'Indefinido'}
                        </span>
                      </div>
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
