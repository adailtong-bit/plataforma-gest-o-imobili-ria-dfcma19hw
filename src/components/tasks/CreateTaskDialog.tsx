import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  CalendarIcon,
  Plus,
  Image as ImageIcon,
  X,
  User,
  Check,
  ChevronsUpDown,
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
  DialogTrigger,
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
import { Checkbox } from '@/components/ui/checkbox'
import usePropertyStore from '@/stores/usePropertyStore'
import useTaskStore from '@/stores/useTaskStore'
import usePartnerStore from '@/stores/usePartnerStore'
import useAuthStore from '@/stores/useAuthStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import useLanguageStore from '@/stores/useLanguageStore'

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
  teamMemberPayout: z.string().optional(),
  description: z.string().optional(),
  backToBack: z.boolean().default(false),
  recurrence: z
    .enum(['none', 'daily', 'weekly', 'monthly', 'yearly'])
    .default('none'),
})

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false)
  const { properties } = usePropertyStore()
  const { addTask } = useTaskStore()
  const { partners } = usePartnerStore()
  const { currentUser } = useAuthStore()
  const { financialSettings } = useFinancialStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [taskTemplates, setTaskTemplates] = useState<
    { label: string; value: string; price: number }[]
  >([])
  const [openCombobox, setOpenCombobox] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      assigneeId: '',
      partnerEmployeeId: 'none',
      priority: 'medium',
      backToBack: false,
      description: '',
      price: '',
      teamMemberPayout: '',
      recurrence: 'none',
    },
  })

  const watchPropertyId = form.watch('propertyId')
  const watchType = form.watch('type')
  const watchAssigneeId = form.watch('assigneeId')

  const selectedProperty = properties.find((p) => p.id === watchPropertyId)

  const relevantPartners = partners.filter((p) => {
    if (watchType === 'cleaning') return p.type === 'cleaning'
    if (watchType === 'maintenance') return p.type === 'maintenance'
    if (watchType === 'inspection') return p.type === 'agent'
    return true
  })

  const selectedPartner = partners.find((p) => p.id === watchAssigneeId)
  const availableEmployees = selectedPartner?.employees || []

  const isAdminOrPM = ['platform_owner', 'software_tenant'].includes(
    currentUser.role,
  )
  const isPartner = currentUser.role === 'partner'

  // Update available templates when partner changes
  useEffect(() => {
    if (selectedPartner && selectedPartner.serviceRates) {
      const templates = selectedPartner.serviceRates.map((rate) => ({
        label: rate.serviceName,
        value: rate.serviceName,
        price: rate.price,
      }))
      setTaskTemplates(templates)
    } else {
      setTaskTemplates([])
    }
  }, [selectedPartner])

  // Auto fetch price when assignee/type changes
  useEffect(() => {
    if (watchAssigneeId && watchType) {
      const partner = partners.find((p) => p.id === watchAssigneeId)
      if (partner && partner.serviceRates) {
        const rate = partner.serviceRates.find(
          (r) =>
            watchType.toLowerCase().includes(r.serviceName.toLowerCase()) ||
            r.serviceName.toLowerCase().includes(watchType.toLowerCase()),
        )
        const currentPrice = form.getValues('price')
        if (rate && (!currentPrice || currentPrice === '')) {
          form.setValue('price', rate.price.toString())
        }
      }
    }
  }, [watchAssigneeId, watchType, partners, form])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fakeUrl = `https://img.usecurling.com/p/300/200?q=issue%20${uploadedImages.length}`
      setUploadedImages([...uploadedImages, fakeUrl])
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const assignee = partners.find((p) => p.id === values.assigneeId)
    let finalPrice = values.price ? parseFloat(values.price) : undefined
    const finalPayout = values.teamMemberPayout
      ? parseFloat(values.teamMemberPayout)
      : undefined

    if (!finalPrice && assignee && assignee.serviceRates) {
      const rate = assignee.serviceRates.find(
        (r) =>
          values.type.toLowerCase().includes(r.serviceName.toLowerCase()) ||
          r.serviceName.toLowerCase().includes(values.type.toLowerCase()),
      )
      if (rate) finalPrice = rate.price
    }

    const employeeId =
      values.partnerEmployeeId === 'none' ? undefined : values.partnerEmployeeId

    // Budget Approval Logic
    const threshold = financialSettings.approvalThreshold || 500
    const isHighValue = finalPrice && finalPrice > threshold
    const initialStatus = isHighValue ? 'pending_approval' : 'pending'

    addTask({
      id: Math.random().toString(36).substr(2, 9),
      title: values.title,
      propertyId: values.propertyId,
      propertyName: selectedProperty?.name || 'Desconhecido',
      propertyAddress: selectedProperty?.address,
      propertyCommunity: selectedProperty?.community,
      status: initialStatus,
      type: values.type,
      assignee: assignee ? assignee.name : 'Desconhecido',
      assigneeId: values.assigneeId,
      partnerEmployeeId: employeeId,
      date: values.date.toISOString(),
      priority: values.priority,
      description: values.description,
      price: finalPrice,
      teamMemberPayout: finalPayout,
      backToBack: values.backToBack,
      recurrence: values.recurrence,
      images: uploadedImages,
    })

    const desc = isHighValue
      ? `Task exceeds $${threshold} and requires approval.`
      : t('tasks.assigned_to', {
          title: values.title,
          name: assignee?.name || '',
        })

    toast({
      title: isHighValue ? 'Pending Approval' : t('tasks.success_created'),
      description: desc,
      variant: isHighValue ? 'default' : 'default',
    })

    setOpen(false)
    form.reset()
    setUploadedImages([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-trust-blue gap-2">
          <Plus className="h-4 w-4" /> {t('tasks.new_task')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{t('tasks.create_title')}</DialogTitle>
          <DialogDescription>{t('tasks.create_desc')}</DialogDescription>
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
                    <FormItem className="col-span-2">
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
                              {p.name}{' '}
                              {p.companyName ? `(${p.companyName})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Smart Task Selection Combobox */}
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
                            <CommandInput placeholder="Buscar template ou criar novo..." />
                            <CommandList>
                              <CommandEmpty>
                                <div className="p-2 text-sm cursor-pointer hover:bg-accent rounded-sm">
                                  Use título personalizado
                                </div>
                              </CommandEmpty>
                              {taskTemplates.length > 0 && (
                                <CommandGroup heading="Templates do Parceiro">
                                  {taskTemplates.map((template) => (
                                    <CommandItem
                                      value={template.label}
                                      key={template.value}
                                      onSelect={() => {
                                        form.setValue('title', template.value)
                                        if (template.price) {
                                          form.setValue(
                                            'price',
                                            template.price.toString(),
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
                                      {template.price && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                          ${template.price}
                                        </span>
                                      )}
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
                          placeholder="Ou digite um título personalizado aqui..."
                          value={field.value}
                          onChange={field.onChange}
                          className={cn(
                            'transition-all duration-300',
                            taskTemplates.length > 0
                              ? 'opacity-70 focus:opacity-100'
                              : '',
                          )}
                        />
                      </div>
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
                          (Opcional)
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

                {/* Financial Fields - Hierarchy Based */}
                {isAdminOrPM && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Pago ao Parceiro ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                        <FormDescription className="text-xs">
                          Quanto o membro da equipe recebe.
                        </FormDescription>
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
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recurrence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recorrência</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Não recorrente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          <SelectItem value="daily">Diária</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchType === 'cleaning' && (
                  <FormField
                    control={form.control}
                    name="backToBack"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-end space-x-3 space-y-0 p-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('tasks.b2b_label')}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
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
                <FormDescription>{t('tasks.photos_desc')}</FormDescription>
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
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-trust-blue">
                {t('tasks.create_btn')}
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
