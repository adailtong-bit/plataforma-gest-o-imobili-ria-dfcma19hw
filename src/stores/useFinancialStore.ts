import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ENV } from '@/lib/env'
import useAuthStore from '@/stores/useAuthStore'

let globalLedger: any[] = []
let globalInvoices: any[] = [
  {
    id: 'inv-1001',
    description: 'Limpeza de rotina - Apto 101',
    amount: 150,
    status: 'pending',
    date: new Date().toISOString(),
    bookingId: 'bk-5521',
    type: 'service',
  },
  {
    id: 'inv-1002',
    description: 'Manutenção de Ar Condicionado',
    amount: 300,
    status: 'paid',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    bookingId: '-',
    type: 'maintenance',
  },
]
let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

export const fetchFinancials = async () => {
  const { data } = await supabase.from('ledger_entries').select('*')
  if (data) {
    globalLedger = data.map((e: any) => ({
      ...e,
      propertyId: e.property_id,
      costType: e.cost_type,
      isRecurring: e.is_recurring,
      recurrenceFrequency: e.recurrence_frequency,
    }))
    notify()
  }
}

fetchFinancials()

const useFinancialStore = () => {
  const [ledgerEntries, setLedgerEntries] = useState<any[]>(globalLedger)
  const [invoices, setInvoices] = useState<any[]>(globalInvoices)
  const { currentUser, simulationMode, simulationRole, allUsers } =
    useAuthStore()

  useEffect(() => {
    const l = () => {
      setLedgerEntries(globalLedger)
      setInvoices(globalInvoices)
    }
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const addInvoice = (inv: any) => {
    globalInvoices = [inv, ...globalInvoices]
    notify()
  }

  const updateInvoice = (inv: any) => {
    globalInvoices = globalInvoices.map((i) => (i.id === inv.id ? inv : i))
    notify()
  }

  const deleteInvoice = (id: string) => {
    globalInvoices = globalInvoices.filter((i) => i.id !== id)
    notify()
  }

  const addLedgerEntry = async (entry: any) => {
    const dbEntry = {
      description: entry.description,
      amount: entry.amount,
      type: entry.type,
      date: entry.date,
      status: entry.status,
      category: entry.category,
      property_id: entry.propertyId,
      cost_type: entry.costType,
      is_recurring: entry.isRecurring,
      recurrence_frequency: entry.recurrenceFrequency,
    }
    const { error } = await supabase.from('ledger_entries').insert(dbEntry)
    if (!error) await fetchFinancials()
  }

  const updateLedgerEntry = async (entry: any) => {
    const dbEntry = {
      description: entry.description,
      amount: entry.amount,
      type: entry.type,
      date: entry.date,
      status: entry.status,
      category: entry.category,
      property_id: entry.propertyId,
      cost_type: entry.costType,
      is_recurring: entry.isRecurring,
      recurrence_frequency: entry.recurrenceFrequency,
    }
    const { error } = await supabase
      .from('ledger_entries')
      .update(dbEntry)
      .eq('id', entry.id)
    if (!error) await fetchFinancials()
  }

  const deleteLedgerEntry = async (id: string) => {
    const { error } = await supabase
      .from('ledger_entries')
      .delete()
      .eq('id', id)
    if (!error) await fetchFinancials()
  }

  const formatAppCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val)

  const finalLedgerEntries = useMemo(() => {
    let targetUserId = currentUser?.id
    if (simulationMode && simulationRole === 'property_owner') {
      const firstOwner = allUsers.find((u) => u.role === 'property_owner')
      if (firstOwner) targetUserId = firstOwner.id
    }

    if (ENV.isDev && targetUserId) {
      const mockPropId = `dev_mock_prop_${targetUserId}`
      const mockEntries = [
        {
          id: `dev_mock_le_1`,
          propertyId: mockPropId,
          description: '[DEV] HOA Monthly Fee',
          amount: 400,
          type: 'expense',
          date: new Date().toISOString(),
          status: 'pending',
          category: 'hoa',
        },
        {
          id: `dev_mock_le_2`,
          propertyId: mockPropId,
          description: '[DEV] Annual Property Tax',
          amount: 2500,
          type: 'expense',
          date: new Date(Date.now() + 86400000 * 10).toISOString(),
          status: 'pending',
          category: 'tax',
        },
        {
          id: `dev_mock_le_3`,
          propertyId: mockPropId,
          description: '[DEV] Payout - Booking #1029',
          amount: 1800,
          type: 'income',
          date: new Date(Date.now() - 86400000 * 3).toISOString(),
          status: 'cleared',
          category: 'booking',
        },
      ]

      const filtered = ledgerEntries.filter(
        (e) => !e.id.startsWith('dev_mock_'),
      )
      return [...filtered, ...mockEntries]
    }
    return ledgerEntries
  }, [ledgerEntries, currentUser, simulationMode, simulationRole, allUsers])

  return {
    ledgerEntries: finalLedgerEntries,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
    formatAppCurrency,
    financials: { invoices },
    addInvoice,
    updateInvoice,
    deleteInvoice,
    financialSettings: {},
    bankStatements: [],
    currency: 'USD',
  }
}

export default useFinancialStore
