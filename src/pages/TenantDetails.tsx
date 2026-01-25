import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Mail,
  Save,
  User,
  Edit,
  X,
  Home,
  History,
  TrendingUp,
  CheckSquare,
  FileText,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { Tenant, InventoryInspection } from '@/lib/types'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InventoryInspectionModal } from '@/components/inventory/InventoryInspectionModal'
import { InventoryReportViewer } from '@/components/inventory/InventoryReportViewer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

export default function TenantDetails() {
  const { id } = useParams()
  const { tenants, updateTenant } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const tenant = tenants.find((t) => t.id === id)
  const property = properties.find((p) => p.id === tenant?.propertyId)
  const owner = owners.find((o) => o.id === property?.ownerId)

  const [formData, setFormData] = useState<Tenant | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Inspection Modal State
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false)
  const [inspectionType, setInspectionType] = useState<
    'check_in' | 'check_out'
  >('check_in')

  // Report Viewer State
  const [reportViewerOpen, setReportViewerOpen] = useState(false)
  const [selectedInspection, setSelectedInspection] =
    useState<InventoryInspection | null>(null)

  useEffect(() => {
    if (tenant) {
      setFormData({ ...tenant })
    }
  }, [tenant])

  if (!formData || !tenant)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Tenant Not Found
      </div>
    )

  const handleSave = () => {
    updateTenant(formData)
    setIsEditing(false)
    toast({ title: 'Perfil atualizado com sucesso' })
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleDocsUpdate = (docs: any) => {
    const updatedTenant = { ...formData, documents: docs }
    setFormData(updatedTenant)
    updateTenant(updatedTenant)
  }

  const handleSendMessage = () => {
    navigate(`/messages?contactId=${formData.id}`)
  }

  const handleInspectionSave = (inspection: InventoryInspection) => {
    const updatedInspections = [...(formData.inspections || []), inspection]
    const updatedTenant = { ...formData, inspections: updatedInspections }
    setFormData(updatedTenant)
    updateTenant(updatedTenant)
    toast({ title: 'Inspection Completed', description: 'Records updated.' })
  }

  const startInspection = (type: 'check_in' | 'check_out') => {
    if (!property?.inventory || property.inventory.length === 0) {
      toast({
        title: 'No Inventory',
        description: 'Property has no master inventory configured.',
        variant: 'destructive',
      })
      return
    }
    setInspectionType(type)
    setInspectionModalOpen(true)
  }

  const viewReport = (inspection: InventoryInspection) => {
    setSelectedInspection(inspection)
    setReportViewerOpen(true)
  }

  const hasCheckIn = formData.inspections?.some((i) => i.type === 'check_in')
  const hasCheckOut = formData.inspections?.some((i) => i.type === 'check_out')

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border w-fit">
          <Link to="/tenants" className="hover:text-foreground">
            Inquilinos
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">{formData.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/tenants">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-navy">
                {formData.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" /> {formData.email}
                <span className="text-muted-foreground/30">•</span>
                <Badge
                  variant={
                    formData.status === 'active' ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {formData.status === 'active' ? 'Ativo' : 'Outro'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-trust-blue"
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSendMessage} variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" /> Mensagem
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="default"
                  size="sm"
                >
                  <Edit className="mr-2 h-4 w-4" /> Editar Dados
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          {/* Tenant Status Alerts */}
          {formData.status === 'active' && !hasCheckIn && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex justify-between items-center rounded-r-md">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Mandatory Check-in Inspection
                  </h3>
                  <p className="text-sm text-yellow-700">
                    This tenant is active but no check-in inventory record
                    exists.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => startInspection('check_in')}
              >
                Perform Check-in
              </Button>
            </div>
          )}

          {formData.status === 'past' && !hasCheckOut && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 flex justify-between items-center rounded-r-md">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">
                    Missing Check-out Inspection
                  </h3>
                  <p className="text-sm text-red-700">
                    Tenant has left but no check-out inventory verification
                    found.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => startInspection('check_out')}
              >
                Perform Check-out
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Personal Info & Contract Config */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-trust-blue" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Nacionalidade</Label>
                    <Input
                      value={formData.country || ''}
                      onChange={(e) => handleChange('country', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Automatic Adjustment Section (New) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Automatic Contract Adjustment
                  </CardTitle>
                  <CardDescription>
                    Configure automatic rent increases for contract renewal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Adjustment Type</Label>
                    <Select
                      value={
                        formData.rentAdjustmentConfig?.type || 'percentage'
                      }
                      onValueChange={(v: any) =>
                        setFormData({
                          ...formData,
                          rentAdjustmentConfig: {
                            ...formData.rentAdjustmentConfig!,
                            type: v,
                          },
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={formData.rentAdjustmentConfig?.value || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rentAdjustmentConfig: {
                            ...formData.rentAdjustmentConfig!,
                            value: parseFloat(e.target.value),
                          },
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Frequency</Label>
                    <Select
                      value={
                        formData.rentAdjustmentConfig?.frequency || 'yearly'
                      }
                      onValueChange={(v: any) =>
                        setFormData({
                          ...formData,
                          rentAdjustmentConfig: {
                            ...formData.rentAdjustmentConfig!,
                            frequency: v,
                          },
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Inspections List */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex flex-col space-y-1.5">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                      Inventory Inspections
                    </CardTitle>
                    <CardDescription>
                      Record of check-in and check-out property states.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!hasCheckIn && (
                      <Button
                        size="sm"
                        onClick={() => startInspection('check_in')}
                      >
                        Start Check-in
                      </Button>
                    )}
                    {hasCheckIn && !hasCheckOut && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startInspection('check_out')}
                      >
                        Start Check-out
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>By</TableHead>
                        <TableHead>Items Checked</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!formData.inspections ||
                      formData.inspections.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-6 text-muted-foreground"
                          >
                            No inspections performed.
                          </TableCell>
                        </TableRow>
                      ) : (
                        formData.inspections.map((insp) => (
                          <TableRow key={insp.id}>
                            <TableCell className="capitalize font-medium">
                              {insp.type.replace('_', ' ')}
                            </TableCell>
                            <TableCell>
                              {format(new Date(insp.date), 'PP')}
                            </TableCell>
                            <TableCell>{insp.performedBy}</TableCell>
                            <TableCell>{insp.items.length}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() => viewReport(insp)}
                              >
                                <FileText className="h-3 w-3" /> View Report
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Property & Lease */}
            <div className="space-y-6">
              {property ? (
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="h-5 w-5 text-slate-500" /> Propriedade
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Link
                        to={`/properties/${property.id}`}
                        className="font-semibold text-lg hover:underline text-primary"
                      >
                        {property.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {property.address}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Aluguel:</span>
                        <span className="font-medium">
                          ${formData.rentValue}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Início:</span>
                        <span>
                          {formData.leaseStart
                            ? new Date(formData.leaseStart).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fim:</span>
                        <span className="font-semibold text-orange-600">
                          {formData.leaseEnd
                            ? new Date(formData.leaseEnd).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/40 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Home className="h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">
                      Nenhuma propriedade vinculada.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="animate-fade-in">
          <DocumentVault
            documents={formData.documents || []}
            onUpdate={handleDocsUpdate}
            canEdit={true}
            title="Documentos do Inquilino"
            description="Contratos, Identificações e Comprovantes."
          />
        </TabsContent>

        <TabsContent value="history" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted ml-3 space-y-6 pb-2">
                {formData.negotiationLogs?.map((log, index) => (
                  <div key={index} className="ml-6 relative">
                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-background" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="font-semibold">{log.action}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.note}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Por: {log.user}
                    </p>
                  </div>
                ))}
                <div className="ml-6 relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-slate-300 ring-4 ring-background" />
                  <p className="font-semibold text-slate-500">
                    Cadastro Criado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inspection Modal */}
      {property && (
        <InventoryInspectionModal
          isOpen={inspectionModalOpen}
          onClose={() => setInspectionModalOpen(false)}
          onSave={handleInspectionSave}
          propertyId={property.id}
          type={inspectionType}
          title={
            inspectionType === 'check_in'
              ? 'Tenant Check-in Inspection'
              : 'Tenant Check-out Inspection'
          }
          performedBy="Manager"
          isOptional={false}
        />
      )}

      {/* Report Viewer */}
      <InventoryReportViewer
        isOpen={reportViewerOpen}
        onClose={() => setReportViewerOpen(false)}
        inspection={selectedInspection}
        title={
          selectedInspection
            ? `${selectedInspection.type === 'check_in' ? 'Check-in' : 'Check-out'} Report`
            : undefined
        }
      />
    </div>
  )
}
