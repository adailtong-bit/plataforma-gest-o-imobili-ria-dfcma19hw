import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ENV } from '@/lib/env'
import useAuthStore from '@/stores/useAuthStore'

let globalLedger: any[] = []
let globalInvoices: any[] = []
let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

export const fetchFinancials = async () => {
  const { data: ledgerData } = await supabase.from('ledger_entries').select('*')
  if (ledgerData) {
    globalLedger = ledgerData.map((e: any) => ({
      ...e,
      propertyId: e.property_id,
      costType: e.cost_type,
      isRecurring: e.is_recurring,
      recurrenceFrequency: e.recurrence_frequency,
      invoiceId: e.invoice_id,
    }))
  }

  const { data: invData } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
  if (invData) {
    globalInvoices = invData.map((inv: any) => ({
      ...inv,
      dueDate: inv.due_date,
      fromName: inv.from_name,
      fromEmail: inv.from_email,
      fromPhone: inv.from_phone,
      fromAddress: inv.from_address,
      toName: inv.to_name,
      toEmail: inv.to_email,
      toPhone: inv.to_phone,
      toAddress: inv.to_address,
      fromId: inv.from_id,
      toId: inv.to_id,
      propertyId: inv.property_id,
      bookingId: inv.booking_id,
    }))
  }
  notify()
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

  const addInvoice = async (inv: any) => {
    const dbInv: any = {
      description: inv.description,
      amount: inv.amount,
      status: inv.status,
      date: inv.date,
      due_date: inv.dueDate || null,
      from_name: inv.fromName,
      from_email: inv.fromEmail,
      from_phone: inv.fromPhone,
      from_address: inv.fromAddress,
      to_name: inv.toName,
      to_email: inv.toEmail,
      to_phone: inv.toPhone,
      to_address: inv.toAddress,
      from_id: inv.fromId || null,
      to_id: inv.toId || null,
      property_id: inv.propertyId || null,
      type: inv.type,
      booking_id: inv.bookingId,
      items: inv.items || [],
      notes: inv.notes,
    }
    if (inv.id) dbInv.id = inv.id
    const { error } = await supabase.from('invoices').insert(dbInv)
    if (!error) await fetchFinancials()
  }

  const updateInvoice = async (inv: any) => {
    const dbInv = {
      description: inv.description,
      amount: inv.amount,
      status: inv.status,
      date: inv.date,
      due_date: inv.dueDate || null,
      from_name: inv.fromName,
      from_email: inv.fromEmail,
      from_phone: inv.fromPhone,
      from_address: inv.fromAddress,
      to_name: inv.toName,
      to_email: inv.toEmail,
      to_phone: inv.toPhone,
      to_address: inv.toAddress,
      from_id: inv.fromId || null,
      to_id: inv.toId || null,
      property_id: inv.propertyId || null,
      type: inv.type,
      booking_id: inv.bookingId,
      items: inv.items || [],
      notes: inv.notes,
    }
    const { error } = await supabase
      .from('invoices')
      .update(dbInv)
      .eq('id', inv.id)

    if (!error) {
      if (inv.status === 'paid' || inv.status === 'finalized') {
        // Automatically mark associated ledger entries as cleared
        await supabase
          .from('ledger_entries')
          .update({ status: inv.status === 'paid' ? 'cleared' : 'pending' })
          .eq('invoice_id', inv.id)
      }
      await fetchFinancials()
    }
  }

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (!error) await fetchFinancials()
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
      invoice_id: entry.invoiceId,
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
