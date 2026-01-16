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
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

const formSchema = z.object({
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres.'),
  propertyId: z.string().min(1, 'Selecione uma propriedade.'),
  type: z.enum(['cleaning', 'maintenance', 'inspection'], {
    required_error: 'Selecione o tipo de serviço.',
  }),
  assignee: z.string().min(2, 'Informe o responsável.'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  date: z.date({ required_error: 'Selecione uma data.' }),
  price: z.string().optional(),
  description: z.string().optional(),
  backToBack: z.boolean().default(false),
})

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false)
  const { properties } = usePropertyStore()
  const { addTask } = useTaskStore()
  const { toast } = useToast()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      assignee: '',
      priority: 'medium',
      backToBack: false,
      description: '',
      price: '',
    },
  })

  const watchPropertyId = form.watch('propertyId')
  const watchType = form.watch('type')

  const selectedProperty = properties.find((p) => p.id === watchPropertyId)

  // Mock upload function
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Create a fake URL for the uploaded file
      // In a real app, this would be an upload to a server
      const fakeUrl = `https://img.usecurling.com/p/300/200?q=issue%20${uploadedImages.length}`
      setUploadedImages([...uploadedImages, fakeUrl])
      e.target.value = '' // Reset input
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    addTask({
      id: Math.random().toString(36).substr(2, 9),
      title: values.title,
      propertyId: values.propertyId,
      propertyName: selectedProperty?.name || 'Desconhecido',
      propertyAddress: selectedProperty?.address,
      propertyCommunity: selectedProperty?.community,
      status: 'pending',
      type: values.type,
      assignee: values.assignee,
      date: values.date.toISOString(),
      priority: values.priority,
      description: values.description,
      price: values.price ? parseFloat(values.price) : undefined,
      backToBack: values.backToBack,
      images: uploadedImages,
    })

    toast({
      title: 'Tarefa criada com sucesso!',
      description: `Tarefa "${values.title}" foi adicionada.`,
    })

    setOpen(false)
    form.reset()
    setUploadedImages([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-trust-blue gap-2">
          <Plus className="h-4 w-4" /> Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Nova Tarefa ou Serviço</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para criar uma nova ordem de serviço.
          </DialogDescription>
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
                      <FormLabel>Propriedade</FormLabel>
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
                      <FormLabel>Título da Tarefa</FormLabel>
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
                      <FormLabel>Tipo de Serviço</FormLabel>
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
                          <SelectItem value="cleaning">Limpeza</SelectItem>
                          <SelectItem value="maintenance">
                            Manutenção
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
                      <FormLabel>Prioridade</FormLabel>
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
                  name="assignee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome ou Empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data Agendada</FormLabel>
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

              {watchType === 'cleaning' && (
                <FormField
                  control={form.control}
                  name="backToBack"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Back-to-Back (Check-out/Check-in)</FormLabel>
                        <FormDescription>
                          Marque se há hóspedes chegando no mesmo dia.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-3">
                <FormLabel>Fotos de Reconhecimento / Referência</FormLabel>
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
                <FormDescription>
                  Adicione fotos do problema ou do local para ajudar o executor.
                </FormDescription>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instruções adicionais, código do cofre, etc..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-trust-blue">
                Criar Tarefa
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
