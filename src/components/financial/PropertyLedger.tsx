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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit, Paperclip, CheckSquare } from 'lucide-react'
import useFinancialStore from '@/stores/useFinancialStore'
import usePartnerStore from '@/stores/usePartnerStore'
import { format } from 'date-fns'
import { LedgerEntry } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface PropertyLedgerProps {
  propertyId: string
  canEdit: boolean
}

export function PropertyLedger({ propertyId, canEdit }: PropertyLedgerProps) {
  const {
    ledgerEntries,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
  } = useFinancialStore()
  const { partners } = usePartnerStore()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [entryForm, setEntryForm] = useState<Partial<LedgerEntry>>({
    type: 'expense',
    category: 'Maintenance',
    amount: 0,
    description: '',
    status: 'pending',
    beneficiaryId: 'none',
  })

  const propertyEntries = ledgerEntries.filter(
    (e) => e.propertyId === propertyId,
  )

  const handlePartnerSelect = (partnerId: string) => {
    setEntryForm({ ...entryForm, beneficiaryId: partnerId })
    const partner = partners.find((p) => p.id === partnerId)
    if (partner && partner.serviceRates && partner.serviceRates.length > 0) {
      // Auto-populate description/value based on first rate as default or logic
      // Simplification: Set value if only 1 rate or default rate exists
      const defaultRate = partner.serviceRates[0]
      if (defaultRate) {
        setEntryForm((prev) => ({
          ...prev,
          amount: defaultRate.price,
          description: `${defaultRate.serviceName} - ${partner.name}`,
          beneficiaryId: partnerId,
        }))
        toast({
          title: 'Valor atualizado',
          description: `Valor sugerido do catálogo do parceiro: $${defaultRate.price}`,
        })
      }
    }
  }

  const handleSave = () => {
    if (!entryForm.amount || !entryForm.description) return

    const entryData: LedgerEntry = {
      id: editingId || `ledg-${Date.now()}`,
      propertyId,
      date: entryForm.date || new Date().toISOString(),
      type: entryForm.type as 'income' | 'expense',
      category: entryForm.category || 'Other',
      amount: Number(entryForm.amount),
      description: entryForm.description,
      status: entryForm.status as 'pending' | 'cleared' | 'void',
      beneficiaryId:
        entryForm.beneficiaryId === 'none'
          ? undefined
          : entryForm.beneficiaryId,
      attachments: entryForm.attachments || [],
    }

    if (editingId) {
      updateLedgerEntry(entryData)
      toast({ title: 'Lançamento atualizado' })
    } else {
      addLedgerEntry(entryData)
      toast({ title: 'Lançamento criado' })
    }

    setOpen(false)
    resetForm()
  }

  const handleEdit = (entry: LedgerEntry) => {
    setEditingId(entry.id)
    setEntryForm(entry)
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteLedgerEntry(id)
    }
  }

  const handleAttachment = () => {
    // Mock attachment upload
    setEntryForm((prev) => ({
      ...prev,
      attachments: [
        ...(prev.attachments || []),
        { name: 'Recibo.pdf', url: '#' },
      ],
    }))
    toast({ title: 'Comprovante anexado' })
  }

  const resetForm = () => {
    setEditingId(null)
    setEntryForm({
      type: 'expense',
      category: 'Maintenance',
      amount: 0,
      description: '',
      status: 'pending',
      beneficiaryId: 'none',
      attachments: [],
    })
  }

  const getTypeColor = (type: string) =>
    type === 'income' ? 'text-green-600' : 'text-red-600'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ledger Financeiro</CardTitle>
        {canEdit && (
          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val)
              if (!val) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="bg-trust-blue">
                <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar' : 'Novo'} Lançamento
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select
                      value={entryForm.type}
                      onValueChange={(v: any) =>
                        setEntryForm({ ...entryForm, type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Select
                      value={entryForm.category}
                      onValueChange={(v) =>
                        setEntryForm({ ...entryForm, category: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rent">Aluguel</SelectItem>
                        <SelectItem value="Maintenance">Manutenção</SelectItem>
                        <SelectItem value="Cleaning">Limpeza</SelectItem>
                        <SelectItem value="HOA">HOA</SelectItem>
                        <SelectItem value="Taxes">Impostos</SelectItem>
                        <SelectItem value="Utilities">Utilidades</SelectItem>
                        <SelectItem value="Management Fee">
                          Taxa de Gestão
                        </SelectItem>
                        <SelectItem value="Other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {entryForm.type === 'expense' && (
                  <div className="grid gap-2">
                    <Label>Parceiro / Beneficiário (Opcional)</Label>
                    <Select
                      value={entryForm.beneficiaryId || 'none'}
                      onValueChange={handlePartnerSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um parceiro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Input
                    value={entryForm.description}
                    onChange={(e) =>
                      setEntryForm({
                        ...entryForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valor ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={entryForm.amount}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, amount: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={entryForm.status}
                      onValueChange={(v: any) =>
                        setEntryForm({ ...entryForm, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="cleared">Pago/Compensado</SelectItem>
                        <SelectItem value="void">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAttachment}
                    >
                      <Paperclip className="h-3 w-3 mr-2" /> Anexar Compovante
                    </Button>
                    {entryForm.attachments &&
                      entryForm.attachments.length > 0 && (
                        <Badge variant="secondary">
                          {entryForm.attachments.length} Anexos
                        </Badge>
                      )}
                  </div>
                  <Button onClick={handleSave}>Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              {canEdit && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {propertyEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhum lançamento registrado.
                </TableCell>
              </TableRow>
            ) : (
              propertyEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{entry.description}</span>
                      {entry.attachments && entry.attachments.length > 0 && (
                        <span className="text-[10px] text-blue-600 flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />{' '}
                          {entry.attachments.length} arquivos
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={getTypeColor(entry.type)}>
                    {entry.type === 'expense' ? '-' : '+'} $
                    {entry.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entry.status === 'cleared' ? 'default' : 'outline'
                      }
                    >
                      {entry.status}
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
