import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { Plus, Trash2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

const itemSchema = z.object({
  description: z.string().min(1, 'Required'),
  amount: z.coerce.number().min(0, 'Must be positive'),
})

const invoiceSchema = z.object({
  invoice_number: z.string().optional(),
  description: z.string().optional(),
  amount: z.coerce.number().min(0),
  due_date: z.string().optional(),
  to_name: z.string().min(1, 'Required'),
  to_email: z.string().email('Invalid email').optional().or(z.literal('')),
  to_phone: z.string().optional(),
  to_address: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  property_id: z.string().optional().or(z.literal('none')),
  items: z.array(itemSchema).optional(),
  notes: z.string().optional(),
})

interface InvoiceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: any | null
  onSuccess: () => void
}

export function InvoiceForm({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: InvoiceFormProps) {
  const { t } = useDbTranslations()
  const [properties, setProperties] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLocked =
    invoice && ['finalized', 'issued', 'paid'].includes(invoice.status)

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: '',
      description: '',
      amount: 0,
      due_date: '',
      to_name: '',
      to_email: '',
      to_phone: '',
      to_address: '',
      type: 'standard',
      status: 'pending',
      property_id: 'none',
      items: [],
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  useEffect(() => {
    if (open) {
      supabase
        .from('properties')
        .select('id, name')
        .then(({ data }) => setProperties(data || []))

      if (invoice) {
        form.reset({
          invoice_number: invoice.invoice_number || '',
          description: invoice.description || '',
          amount: invoice.amount || 0,
          due_date: invoice.due_date
            ? new Date(invoice.due_date).toISOString().split('T')[0]
            : '',
          to_name: invoice.to_name || '',
          to_email: invoice.to_email || '',
          to_phone: invoice.to_phone || '',
          to_address: invoice.to_address || '',
          type: invoice.type || 'standard',
          status: invoice.status || 'pending',
          property_id: invoice.property_id || 'none',
          items: invoice.items || [],
          notes: invoice.notes || '',
        })
      } else {
        form.reset({
          invoice_number: '',
          description: '',
          amount: 0,
          due_date: '',
          to_name: '',
          to_email: '',
          to_phone: '',
          to_address: '',
          type: 'standard',
          status: 'pending',
          property_id: 'none',
          items: [],
          notes: '',
        })
      }
    }
  }, [open, invoice, form])

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('items')) {
        const items = value.items || []
        if (items.length > 0) {
          const total = items.reduce(
            (sum, item) => sum + (Number(item?.amount) || 0),
            0,
          )
          form.setValue('amount', total)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch, form])

  const onSubmit = async (values: z.infer<typeof invoiceSchema>) => {
    setIsSubmitting(true)
    try {
      const payload: any = {
        description: values.description,
        status: values.status,
        to_name: values.to_name,
        to_email: values.to_email || null,
        to_phone: values.to_phone,
        to_address: values.to_address,
        type: values.type,
        notes: values.notes,
        updated_at: new Date().toISOString(),
      }

      if (!isLocked) {
        payload.invoice_number = values.invoice_number
        payload.amount = values.amount
        payload.due_date = values.due_date
          ? new Date(values.due_date).toISOString()
          : null
        payload.property_id =
          values.property_id === 'none' ? null : values.property_id
        payload.items = values.items
      }

      if (invoice?.id) {
        const { error } = await supabase
          .from('invoices')
          .update(payload)
          .eq('id', invoice.id)
        if (error) throw error
        toast.success(
          t('invoices.update_success', 'Invoice updated successfully'),
        )
      } else {
        payload.date = new Date().toISOString()
        const { error } = await supabase.from('invoices').insert([payload])
        if (error) throw error
        toast.success(
          t('invoices.create_success', 'Invoice created successfully'),
        )
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Error saving invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col h-full bg-white p-0">
        <div className="p-6 pb-2 border-b">
          <SheetHeader>
            <SheetTitle>
              {invoice
                ? t('invoices.edit', 'Edit Invoice')
                : t('invoices.new', 'New Invoice')}
            </SheetTitle>
          </SheetHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {isLocked && (
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm border border-amber-200">
                    This invoice is {invoice.status}. Key fields are locked for
                    immutability.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoice_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLocked} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          disabled={isLocked && invoice?.status === 'paid'}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="issued">Issued</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="to_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Name *</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLocked} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="to_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} disabled={isLocked} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isLocked} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            disabled={isLocked || fields.length > 0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="property_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property (Optional)</FormLabel>
                      <Select
                        disabled={isLocked}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {properties.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel>Line Items</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ description: '', amount: 0 })}
                      disabled={isLocked}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field: f }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                {...f}
                                disabled={isLocked}
                                placeholder="Description"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.amount`}
                        render={({ field: f }) => (
                          <FormItem className="w-32">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...f}
                                disabled={isLocked}
                                placeholder="Amount"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={isLocked}
                        className="mt-0.5"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="text-sm text-slate-500 italic">
                      No line items. Using manual total amount.
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          placeholder="Visible only to you"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <SheetFooter className="p-6 border-t bg-slate-50 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Save Invoice
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
