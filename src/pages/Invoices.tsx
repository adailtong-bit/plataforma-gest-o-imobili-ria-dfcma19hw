import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { InvoiceList } from '@/components/invoices/InvoiceList'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'

export default function Invoices() {
  const { t, locale } = useDbTranslations()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  const fetchInvoices = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('invoices')
      .select('*, properties(name)')
      .order('date', { ascending: false })
      .limit(100)

    setInvoices(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.toLowerCase()
    return (
      (inv.invoice_number || '').toLowerCase().includes(q) ||
      (inv.to_name || '').toLowerCase().includes(q) ||
      (inv.to_email || '').toLowerCase().includes(q) ||
      (inv.description || '').toLowerCase().includes(q)
    )
  })

  const handleEdit = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedInvoice(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('invoices.title', 'Invoices')}
          </h1>
          <p className="text-slate-500">
            {t('invoices.subtitle', 'Manage your invoices')}
          </p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('invoices.new', 'New Invoice')}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <CardTitle>{t('invoices.list', 'Invoice List')}</CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder={t('invoices.search', 'Search invoices...')}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <InvoiceList
            invoices={filteredInvoices}
            loading={loading}
            onEdit={handleEdit}
            locale={locale}
            t={t}
          />
        </CardContent>
      </Card>

      <InvoiceForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        invoice={selectedInvoice}
        onSuccess={fetchInvoices}
      />
    </div>
  )
}
