import { useContext, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhoneInput } from '@/components/ui/phone-input'
import { applyDocumentMask, applyZipCodeMask } from '@/lib/utils'
import { DocumentVault } from '@/components/documents/DocumentVault'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tenant } from '@/lib/types'

export default function Tenants() {
  const { tenants, addTenant, updateTenant, formatAppCurrency } =
    useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Tenant>>({})

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({})
    setIsOpen(true)
  }
  const handleOpenEdit = (tenant: Tenant) => {
    setEditingId(tenant.id)
    setForm(tenant)
    setIsOpen(true)
  }

  const handleSave = () => {
    if (editingId) {
      updateTenant({ ...form } as Tenant)
      toast({ title: 'Inquilino alterado com sucesso' })
    } else {
      addTenant({
        ...form,
        id: `tenant-${Date.now()}`,
        name: form.name || 'Novo Inquilino',
        status: 'active',
        role: 'tenant',
        rentValue: form.rentValue || 0,
      } as Tenant)
      toast({ title: 'Inquilino incluído com sucesso' })
    }
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.tenants') || 'Inquilinos'}
          </h1>
          <p className="text-muted-foreground">Manage your tenant directory.</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-trust-blue gap-2 text-white"
        >
          <Plus className="h-4 w-4" /> Incluir
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Alterar Inquilino' : 'Incluir Inquilino'}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="personal" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="contact">Contato e Endereço</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>
            <TabsContent
              value="personal"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-1">
                <Label>Nome Completo</Label>
                <Input
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>CPF / CNPJ</Label>
                <Input
                  maxLength={18}
                  value={form.cpfCnpj || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cpfCnpj: applyDocumentMask(e.target.value, 'BR'),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>RG</Label>
                <Input
                  value={form.rg || ''}
                  onChange={(e) => setForm({ ...form, rg: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Nascimento</Label>
                <Input
                  type="date"
                  value={form.dob || ''}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Nacionalidade</Label>
                <Input
                  value={form.nationality || ''}
                  onChange={(e) =>
                    setForm({ ...form, nationality: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Estado Civil</Label>
                <Select
                  value={form.maritalStatus || ''}
                  onValueChange={(v) => setForm({ ...form, maritalStatus: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="Casado">Casado(a)</SelectItem>
                    <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="Viuvo">Viúvo(a)</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Profissão</Label>
                <Input
                  value={form.profession || ''}
                  onChange={(e) =>
                    setForm({ ...form, profession: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Renda Mensal</Label>
                <Input
                  type="number"
                  value={form.monthlyIncome || ''}
                  onChange={(e) =>
                    setForm({ ...form, monthlyIncome: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Aluguel Base</Label>
                <Input
                  type="number"
                  value={form.rentValue || ''}
                  onChange={(e) =>
                    setForm({ ...form, rentValue: Number(e.target.value) })
                  }
                />
              </div>
            </TabsContent>
            <TabsContent value="contact" className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3 border-b pb-2">
                  Contatos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>Telefone Principal</Label>
                    <PhoneInput
                      value={form.phone || ''}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      defaultCountry="BR"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Telefone Secundário</Label>
                    <PhoneInput
                      value={form.secondaryPhone || ''}
                      onChange={(e) =>
                        setForm({ ...form, secondaryPhone: e.target.value })
                      }
                      defaultCountry="BR"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>WhatsApp</Label>
                    <PhoneInput
                      value={form.whatsapp || ''}
                      onChange={(e) =>
                        setForm({ ...form, whatsapp: e.target.value })
                      }
                      defaultCountry="BR"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3 border-b pb-2">
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1 md:col-span-1">
                    <Label>CEP</Label>
                    <Input
                      maxLength={9}
                      value={form.zipCode || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          zipCode: applyZipCodeMask(e.target.value, 'BR'),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Logradouro</Label>
                    <Input
                      value={form.address || ''}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>Número</Label>
                    <Input
                      value={form.addressNumber || ''}
                      onChange={(e) =>
                        setForm({ ...form, addressNumber: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>Complemento</Label>
                    <Input
                      value={form.complement || ''}
                      onChange={(e) =>
                        setForm({ ...form, complement: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>Bairro</Label>
                    <Input
                      value={form.neighborhood || ''}
                      onChange={(e) =>
                        setForm({ ...form, neighborhood: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>Cidade</Label>
                    <Input
                      value={form.city || ''}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>Estado</Label>
                    <Input
                      value={form.state || ''}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="documents">
              <DocumentVault
                documents={form.documents || []}
                onUpdate={(docs) => setForm({ ...form, documents: docs })}
                canEdit={true}
                entityContext={
                  form.name
                    ? {
                        id: editingId || 'new',
                        name: form.name,
                        type: 'tenant',
                      }
                    : undefined
                }
              />
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name') || 'Nome'}</TableHead>
                <TableHead>CPF / CNPJ</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Aluguel</TableHead>
                <TableHead>{t('common.status') || 'Status'}</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{tenant.name}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{tenant.cpfCnpj || '-'}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{tenant.email}</DataMask>
                  </TableCell>
                  <TableCell>{formatAppCurrency(tenant.rentValue)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tenant.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(tenant)}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Alterar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Excluir Inquilino
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                toast({
                                  title: 'Inquilino excluído com sucesso',
                                })
                              }
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
