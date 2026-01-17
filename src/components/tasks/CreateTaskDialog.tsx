import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  CalendarIcon,
  Plus,
  MapPin,
  Building,
  Image as ImageIcon,
  X,
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
import { Checkbox } from '@/components/ui/checkbox'
import usePropertyStore from '@/stores/usePropertyStore'
import useTaskStore from '@/stores/useTaskStore'
import usePartnerStore from '@/stores/usePartnerStore'
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
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  date: z.date({ required_error: 'Selecione uma data.' }),
  price: z.string().optional(),
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
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      assigneeId: '',
      priority: 'medium',
      backToBack: false,
      description: '',
      price: '',
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

  // Auto fetch price when assignee changes
  if (watchAssigneeId && watchType) {
    const partner = partners.find((p) => p.id === watchAssigneeId)
    if (partner && partner.serviceRates) {
      // Simple matching of task title or type with service name
      const rate = partner.serviceRates.find(
        (r) =>
          watchType.toLowerCase().includes(r.serviceName.toLowerCase()) ||
          r.serviceName.toLowerCase().includes(watchType.toLowerCase()),
      )

      // We only auto-set if the price field is empty to allow overrides,
      // but in this controlled form loop it might fight. Better to just suggest or hint.
      // For now, we won't force it in the UI loop to avoid infinite re-renders or complexity,
      // but the store handles it if price is undefined.
    }
  }

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

    // If price is not set, try to get from catalog
    if (!finalPrice && assignee && assignee.serviceRates) {
      const rate = assignee.serviceRates.find(
        (r) =>
          values.type.toLowerCase().includes(r.serviceName.toLowerCase()) ||
          r.serviceName.toLowerCase().includes(values.type.toLowerCase()),
      )
      if (rate) finalPrice = rate.price
    }

    addTask({
      id: Math.random().toString(36).substr(2, 9),
      title: values.title,
      propertyId: values.propertyId,
      propertyName: selectedProperty?.name || 'Desconhecido',
      propertyAddress: selectedProperty?.address,
      propertyCommunity: selectedProperty?.community,
      status: 'pending',
      type: values.type,
      assignee: assignee ? assignee.name : 'Desconhecido',
      assigneeId: values.assigneeId,
      date: values.date.toISOString(),
      priority: values.priority,
      description: values.description,
      price: finalPrice,
      backToBack: values.backToBack,
      recurrence: values.recurrence,
      images: uploadedImages,
    })

    toast({
      title: t('tasks.success_created'),
      description: t('tasks.assigned_to', {
        title: values.title,
        name: assignee?.name || '',
      }),
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
                      <FormControl>
                        <Input
                          placeholder="Ex: Limpeza de Check-out"
                          {...field}
                        />
                      </FormControl>
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
