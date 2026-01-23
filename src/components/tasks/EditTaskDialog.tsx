import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  CalendarIcon,
  MapPin,
  Building,
  Image as ImageIcon,
  X,
  User,
  Save,
  ChevronsUpDown,
  Check,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import usePropertyStore from '@/stores/usePropertyStore'
import useTaskStore from '@/stores/useTaskStore'
import usePartnerStore from '@/stores/usePartnerStore'
import useAuthStore from '@/stores/useAuthStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import useLanguageStore from '@/stores/useLanguageStore'
import { Task, ServiceRate } from '@/lib/types'

const formSchema = z.object({
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres.'),
  propertyId: z.string().min(1, 'Selecione uma propriedade.'),
  type: z.enum(['cleaning', 'maintenance', 'inspection'], {
    required_error: 'Selecione o tipo de serviço.',
  }),
  assigneeId: z.string().min(2, 'Selecione o responsável.'),
  partnerEmployeeId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  date: z.date({ required_error: 'Selecione uma data.' }),
  price: z.string().optional(),
  materialCost: z.string().optional(),
  teamMemberPayout: z.string().optional(),
  description: z.string().optional(),
  backToBack: z.boolean().default(false),
  recurrence: z
    .enum(['none', 'daily', 'weekly', 'monthly', 'yearly'])
    .default('none'),
})

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const { properties } = usePropertyStore()
  const { updateTask } = useTaskStore()
  const { partners, genericServiceRates } = usePartnerStore()
  const { currentUser } = useAuthStore()
  const { financialSettings } = useFinancialStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [taskTemplates, setTaskTemplates] = useState<
    { label: string; value: string; rate: ServiceRate }[]
  >([])
  const [openCombobox, setOpenCombobox] = useState(false)

  const isAdminOrPM = ['platform_owner', 'software_tenant'].includes(
    currentUser.role,
  )
  const isPartner = currentUser.role === 'partner'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      propertyId: task.propertyId,
      type: task.type as any,
      assigneeId: task.assigneeId || '',
      partnerEmployeeId: task.partnerEmployeeId || 'none',
      priority: task.priority,
      date: new Date(task.date),
      price: task.laborCost
        ? task.laborCost.toString()
        : task.price
          ? task.price.toString()
          : '',
      materialCost: task.materialCost ? task.materialCost.toString() : '',
      teamMemberPayout: task.teamMemberPayout
        ? task.teamMemberPayout.toString()
        : '',
      description: task.description || '',
      backToBack: task.backToBack || false,
      recurrence: task.recurrence || 'none',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: task.title,
        propertyId: task.propertyId,
        type: task.type as any,
        assigneeId: task.assigneeId || '',
        partnerEmployeeId: task.partnerEmployeeId || 'none',
        priority: task.priority,
        date: new Date(task.date),
        price: task.laborCost
          ? task.laborCost.toString()
          : task.price
            ? task.price.toString()
            : '',
        materialCost: task.materialCost ? task.materialCost.toString() : '',
        teamMemberPayout: task.teamMemberPayout
          ? task.teamMemberPayout.toString()
          : '',
        description: task.description || '',
        backToBack: task.backToBack || false,
        recurrence: task.recurrence || 'none',
      })
      setUploadedImages(task.images || [])
    }
  }, [open, task, form])

  const watchPropertyId = form.watch('propertyId')
  const watchType = form.watch('type')
  const watchAssigneeId = form.watch('assigneeId')
  const watchPrice = form.watch('price')
  const watchMaterial = form.watch('materialCost')

  // Recalculate billable for preview
  const laborCost = parseFloat(watchPrice || '0')
  const materialCost = parseFloat(watchMaterial || '0')
  const laborMargin = financialSettings.maintenanceMarginLabor || 0
  const materialMargin = financialSettings.maintenanceMarginMaterial || 0
  const estimatedBillable =
    laborCost * (1 + laborMargin / 100) +
    materialCost * (1 + materialMargin / 100)

  const selectedProperty = properties.find((p) => p.id === watchPropertyId)

  const relevantPartners = partners
    .filter((p) => {
      if (watchType === 'cleaning') return p.type === 'cleaning'
      if (watchType === 'maintenance') return p.type === 'maintenance'
      if (watchType === 'inspection') return p.type === 'agent'
      return true
    })
    .filter((p, index, self) => index === self.findIndex((t) => t.id === p.id))

  const selectedPartner = partners.find((p) => p.id === watchAssigneeId)
  const availableEmployees = selectedPartner?.employees || []

  useEffect(() => {
    let templates: { label: string; value: string; rate: ServiceRate }[] = []

    // 1. Add generic rates
    if (genericServiceRates && genericServiceRates.length > 0) {
      templates = genericServiceRates.map((rate) => ({
        label: `${rate.serviceName} (Genérico)`,
        value: rate.serviceName,
        rate: rate,
      }))
    }

    // 2. Add partner specific rates
    if (selectedPartner && selectedPartner.serviceRates) {
      const partnerTemplates = selectedPartner.serviceRates.map((rate) => ({
        label: rate.serviceName,
        value: rate.serviceName,
        rate: rate,
      }))
      templates = [...templates, ...partnerTemplates]
    }

    setTaskTemplates(templates)
  }, [selectedPartner, genericServiceRates])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fakeUrl = `https://img.usecurling.com/p/300/200?q=issue%20${uploadedImages.length + 100}`
      setUploadedImages([...uploadedImages, fakeUrl])
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const assignee = partners.find((p) => p.id === values.assigneeId)
    const finalLabor = values.price ? parseFloat(values.price) : 0
    const finalMaterial = values.materialCost
      ? parseFloat(values.materialCost)
      : 0
    const finalPayout = values.teamMemberPayout
      ? parseFloat(values.teamMemberPayout)
      : undefined

    const employeeId =
      values.partnerEmployeeId === 'none' ? undefined : values.partnerEmployeeId

    updateTask({
      ...task,
      title: values.title,
      propertyId: values.propertyId,
      propertyName: selectedProperty?.name || task.propertyName,
      propertyAddress: selectedProperty?.address || task.propertyAddress,
      propertyCommunity: selectedProperty?.community || task.propertyCommunity,
      type: values.type,
      assignee: assignee ? assignee.name : 'Desconhecido',
      assigneeId: values.assigneeId,
      partnerEmployeeId: employeeId,
      date: values.date.toISOString(),
      priority: values.priority,
      description: values.description,
      price: finalLabor, // Vendor Labor Cost
      laborCost: finalLabor,
      materialCost: finalMaterial,
      billableAmount: estimatedBillable, // Updated billable
      teamMemberPayout: finalPayout,
      backToBack: values.backToBack,
      recurrence: values.recurrence,
      images: uploadedImages,
    })

    toast({
      title: t('common.save'),
      description: 'Tarefa atualizada com sucesso.',
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>Atualize os detalhes da tarefa.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>{t('tenants.property')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma propriedade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties.map((prop) => (
                            <SelectItem key={prop.id} value={prop.id}>
                              {prop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedProperty && (
                  <div className="col-span-2 bg-muted/40 p-3 rounded-md border text-sm grid gap-1 animate-fade-in">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span className="font-semibold text-foreground">
                        {selectedProperty.community}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedProperty.address}</span>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>{t('tasks.task_title')}</FormLabel>
                      <Popover
                        open={openCombobox}
                        onOpenChange={setOpenCombobox}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value || 'Selecione ou digite um título'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar template..." />
                            <CommandList>
                              <CommandEmpty>
                                Use título personalizado
                              </CommandEmpty>
                              {taskTemplates.length > 0 && (
                                <CommandGroup heading="Templates de Serviço">
                                  {taskTemplates.map((template) => (
                                    <CommandItem
                                      value={template.label}
                                      key={`${template.value}-${template.rate.id}`}
                                      onSelect={() => {
                                        form.setValue('title', template.value)
                                        if (template.rate) {
                                          form.setValue(
                                            'price',
                                            (
                                              template.rate.partnerPayment || 0
                                            ).toString(),
                                          )
                                          form.setValue(
                                            'materialCost',
                                            (
                                              template.rate.productPrice || 0
                                            ).toString(),
                                          )
                                        }
                                        setOpenCombobox(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          template.value === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      {template.label}
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        Billable: $
                                        {template.rate.servicePrice?.toFixed(2)}
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className="mt-2">
                        <Input
                          placeholder="Ou digite um título personalizado..."
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('tasks.service_type')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cleaning">
                            {t('partners.cleaning')}
                          </SelectItem>
                          <SelectItem value="maintenance">
                            {t('partners.maintenance')}
                          </SelectItem>
                          <SelectItem value="inspection">Inspeção</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.priority')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('tasks.assignee')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!watchType}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione Parceiro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {relevantPartners.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.companyName || ''})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchAssigneeId && (
                  <FormField
                    control={form.control}
                    name="partnerEmployeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <User className="h-3 w-3" /> Membro da Equipe
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Atribuir a..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum (Geral)</SelectItem>
                            {availableEmployees.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.name} ({e.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {isAdminOrPM && (
                  <>
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Partner Payment (Cost)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="materialCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Price (Cost)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-2 bg-muted/20 p-2 rounded text-sm flex justify-between">
                      <span>Total Estimado (para o proprietário):</span>
                      <span className="font-bold">
                        ${estimatedBillable.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                {(isAdminOrPM || isPartner) && (
                  <FormField
                    control={form.control}
                    name="teamMemberPayout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pagamento Equipe ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('tasks.scheduled_date')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <FormLabel>{t('tasks.photos_ref')}</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 w-20 rounded-md overflow-hidden border group"
                    >
                      <img
                        src={img}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="h-20 w-20 rounded-md border border-dashed flex items-center justify-center relative hover:bg-muted/50 transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tasks.detailed_desc')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('tasks.desc_placeholder')}
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-trust-blue">
                <Save className="h-4 w-4 mr-2" /> Salvar Alterações
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
