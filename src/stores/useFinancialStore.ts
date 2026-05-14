import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

let globalLedger: any[] = []
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

  useEffect(() => {
    const l = () => setLedgerEntries(globalLedger)
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

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

  return {
    ledgerEntries,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
    formatAppCurrency,
    financials: [],
    financialSettings: {},
    bankStatements: [],
    currency: 'USD',
  }
}

export default useFinancialStore
