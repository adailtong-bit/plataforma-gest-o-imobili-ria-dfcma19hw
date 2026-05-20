import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Languages,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const translationSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  locale: z.string().min(1, 'Locale is required'),
  value: z.string().min(1, 'Value is required'),
})

type TranslationFormValues = z.infer<typeof translationSchema>
type Translation = { id: string; key: string; locale: string; value: string }

export default function TranslationsAdmin() {
  const { toast } = useToast()

  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [localeFilter, setLocaleFilter] = useState('all')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTranslation, setSelectedTranslation] =
    useState<Translation | null>(null)

  const form = useForm<TranslationFormValues>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      key: '',
      locale: 'en',
      value: '',
    },
  })

  const loadTranslations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('ui_translations')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      toast({
        title: 'Error fetching translations',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setTranslations(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTranslations()
  }, [])

  // Derived state for filtering and pagination
  const filteredTranslations = useMemo(() => {
    return translations.filter((item) => {
      const matchesSearch =
        item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.value.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLocale =
        localeFilter === 'all' || item.locale === localeFilter
      return matchesSearch && matchesLocale
    })
  }, [translations, searchQuery, localeFilter])

  const totalPages = Math.ceil(filteredTranslations.length / itemsPerPage)
  const paginatedTranslations = filteredTranslations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, localeFilter])

  const handleOpenForm = (translation?: Translation) => {
    if (translation) {
      setSelectedTranslation(translation)
      form.reset({
        key: translation.key,
        locale: translation.locale,
        value: translation.value,
      })
    } else {
      setSelectedTranslation(null)
      form.reset({
        key: '',
        locale: 'en',
        value: '',
      })
    }
    setIsFormOpen(true)
  }

  const onSubmit = async (values: TranslationFormValues) => {
    try {
      if (selectedTranslation) {
        // Update
        const { error } = await supabase
          .from('ui_translations')
          .update(values)
          .eq('id', selectedTranslation.id)

        if (error) {
          if (error.code === '23505') {
            throw new Error(
              'A translation with this key and locale already exists.',
            )
          }
          throw error
        }

        toast({
          title: 'Translation updated successfully',
          description: 'Reload the page to see changes in the UI.',
        })
      } else {
        // Create
        // Check for duplicates first to be safe, though DB constraint will catch it
        const { data: existing } = await supabase
          .from('ui_translations')
          .select('id')
          .eq('key', values.key)
          .eq('locale', values.locale)
          .maybeSingle()

        if (existing) {
          throw new Error(
            'A translation with this key and locale already exists.',
          )
        }

        const { error } = await supabase.from('ui_translations').insert(values)

        if (error) throw error

        toast({
          title: 'Translation created successfully',
          description: 'Reload the page to see changes in the UI.',
        })
      }

      setIsFormOpen(false)
      loadTranslations()
    } catch (error: any) {
      toast({
        title: 'Error saving translation',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedTranslation) return

    const { error } = await supabase
      .from('ui_translations')
      .delete()
      .eq('id', selectedTranslation.id)

    if (error) {
      toast({
        title: 'Error deleting translation',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Translation deleted successfully' })
      setIsDeleteDialogOpen(false)
      setSelectedTranslation(null)
      loadTranslations()
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Languages className="w-6 h-6 text-primary" />
            Translation Management
          </h1>
          <p className="text-slate-500">
            Manage UI translations for EN, PT, and ES.
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Translation
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by key or value..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={localeFilter} onValueChange={setLocaleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by locale" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locales</SelectItem>
            <SelectItem value="en">English (EN)</SelectItem>
            <SelectItem value="pt">Portuguese (PT)</SelectItem>
            <SelectItem value="es">Spanish (ES)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Key</TableHead>
              <TableHead className="w-[15%]">Locale</TableHead>
              <TableHead className="w-[45%]">Value</TableHead>
              <TableHead className="text-right w-[10%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : paginatedTranslations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-slate-500"
                >
                  No translations found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTranslations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-700 font-mono text-sm break-all">
                    {item.key}
                  </TableCell>
                  <TableCell>
                    <span className="uppercase text-xs font-bold tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {item.locale}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 max-w-xs truncate">
                    {item.value}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenForm(item)}
                        className="text-slate-500 hover:text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTranslation(item)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="border-t border-slate-200 p-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(
                currentPage * itemsPerPage,
                filteredTranslations.length,
              )}{' '}
              of {filteredTranslations.length} entries
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTranslation ? 'Edit Translation' : 'Add New Translation'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Translation Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. service_pricing.title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locale</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a locale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English (EN)</SelectItem>
                        <SelectItem value="pt">Portuguese (PT)</SelectItem>
                        <SelectItem value="es">Spanish (ES)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Translation Value</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the translated text..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {selectedTranslation ? 'Save Changes' : 'Create Translation'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the translation for key "
              {selectedTranslation?.key}" ({selectedTranslation?.locale}). This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
