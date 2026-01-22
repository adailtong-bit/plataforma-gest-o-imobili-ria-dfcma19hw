import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Save,
  Trash2,
  Users,
  Building,
  DollarSign,
  ClipboardList,
  FileText,
  MessageCircle,
  Mail,
  Star,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import usePartnerStore from '@/stores/usePartnerStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useTaskStore from '@/stores/useTaskStore'
import { Partner } from '@/lib/types'
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
import { PartnerStaff } from '@/components/partners/PartnerStaff'
import { PartnerProperties } from '@/components/partners/PartnerProperties'
import { PartnerTasks } from '@/components/partners/PartnerTasks'
import { PartnerPricing } from '@/components/partners/PartnerPricing'
import { PartnerDocuments } from '@/components/partners/PartnerDocuments'
import { isValidEmail } from '@/lib/utils'

export default function PartnerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { partners, updatePartner } = usePartnerStore()
  const { ledgerEntries } = useFinancialStore()
  const { tasks } = useTaskStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const partner = partners.find((p) => p.id === id)

  const [formData, setFormData] = useState<Partner | null>(() =>
    partner ? JSON.parse(JSON.stringify(partner)) : null,
  )

  if (!partner || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-semibold">Parceiro não encontrado</h2>
        <Button variant="outline" onClick={() => navigate('/partners')}>
          Voltar para Lista
        </Button>
      </div>
    )
  }

  // Calculate Average Rating
  const partnerTasks = tasks.filter((t) => t.assigneeId === id && t.rating)
  const averageRating =
    partnerTasks.length > 0
      ? partnerTasks.reduce((acc, t) => acc + (t.rating || 0), 0) /
        partnerTasks.length
      : partner.rating || 5.0

  const handleSave = () => {
    if (!formData) return

    if (!formData.name?.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do parceiro é obrigatório.',
        variant: 'destructive',
      })
      return
    }
    if (!formData.email?.trim() || !isValidEmail(formData.email)) {
      toast({
        title: 'Erro',
        description: 'Email inválido.',
        variant: 'destructive',
      })
      return
    }

    updatePartner(formData)
    toast({
      title: t('common.save'),
      description: 'Dados do parceiro atualizados.',
    })
  }

  const handleUpdate = (updatedPartner: Partner) => {
    setFormData(updatedPartner)
    updatePartner(updatedPartner)
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este parceiro?')) {
      toast({ title: 'Excluído', description: 'Parceiro removido.' })
      navigate('/partners')
    }
  }

  const handleWhatsApp = () => {
    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    }
  }

  const handleEmail = () => {
    if (formData.email) {
      window.location.href = `mailto:${formData.email}`
    }
  }

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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-navy">
                {formData.name}
              </h1>
              <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md border border-yellow-200">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-bold text-sm">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <span>{formData.companyName}</span>
              <div className="flex gap-1 ml-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={handleWhatsApp}
                  title="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={handleEmail}
                  title="Email"
                >
                  <Mail className="h-4 w-4 text-blue-600" />
                </Button>
              </div>
            </div>
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
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{t('properties.overview')}</TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" /> {t('common.documents')}
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="h-4 w-4 mr-2" /> {t('common.team')}
          </TabsTrigger>
          <TabsTrigger value="properties">
            <Building className="h-4 w-4 mr-2" /> {t('common.properties')}
          </TabsTrigger>
          <TabsTrigger value="rates">
            <DollarSign className="h-4 w-4 mr-2" /> Preços
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ClipboardList className="h-4 w-4 mr-2" /> {t('common.tasks')}
          </TabsTrigger>
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

        <TabsContent value="documents">
          <PartnerDocuments
            partner={formData}
            onUpdate={handleUpdate}
            canEdit={true}
          />
        </TabsContent>

        <TabsContent value="staff">
          <PartnerStaff
            partner={formData}
            onUpdate={handleUpdate}
            canEdit={true}
          />
        </TabsContent>

        <TabsContent value="properties">
          <PartnerProperties
            partner={formData}
            onUpdate={handleUpdate}
            canEdit={true}
          />
        </TabsContent>

        <TabsContent value="rates">
          <PartnerPricing
            partner={formData}
            onUpdate={handleUpdate}
            canEdit={true}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <PartnerTasks partnerId={formData.id} canEdit={true} />
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
                  {partnerEntries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum pagamento encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    partnerEntries.map((entry) => (
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
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
