import { useState, useEffect } from 'react'
import { BillingAgreement, BillingPeriod } from '@/lib/types'

let globalAgreements: BillingAgreement[] = [
  {
    id: 'ba-1',
    sourceRole: 'master',
    targetId: 'global',
    targetRole: 'software_tenant',
    name: 'Platform License per House',
    type: 'software_fee_per_house',
    valueType: 'fixed',
    value: 10,
    frequency: 'monthly',
    validFrom: '2025-01-01',
    status: 'active',
  },
  {
    id: 'ba-2',
    sourceRole: 'software_tenant',
    targetId: 'global',
    targetRole: 'property_owner',
    name: 'Booking Revenue Share',
    type: 'booking_percentage',
    valueType: 'percentage',
    value: 15,
    frequency: 'per_booking',
    validFrom: '2025-01-01',
    status: 'active',
  },
]

let globalPeriods: BillingPeriod[] = [
  {
    id: 'bp-1',
    targetId: 'pm-1',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    status: 'closed',
    totalAmount: 1250,
  },
  {
    id: 'bp-2',
    targetId: 'pm-1',
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    status: 'open',
    totalAmount: 450,
  },
]

let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

export default function useBillingStore() {
  const [agreements, setAgreements] =
    useState<BillingAgreement[]>(globalAgreements)
  const [periods, setPeriods] = useState<BillingPeriod[]>(globalPeriods)

  useEffect(() => {
    const l = () => {
      setAgreements(globalAgreements)
      setPeriods(globalPeriods)
    }
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const addAgreement = (agreement: BillingAgreement) => {
    globalAgreements = [...globalAgreements, agreement]
    notify()
  }

  const updateAgreement = (agreement: BillingAgreement) => {
    globalAgreements = globalAgreements.map((a) =>
      a.id === agreement.id ? agreement : a,
    )
    notify()
  }

  const deleteAgreement = (id: string) => {
    globalAgreements = globalAgreements.filter((a) => a.id !== id)
    notify()
  }

  const addPeriod = (period: BillingPeriod) => {
    globalPeriods = [...globalPeriods, period]
    notify()
  }

  const updatePeriod = (period: BillingPeriod) => {
    globalPeriods = globalPeriods.map((p) => (p.id === period.id ? period : p))
    notify()
  }

  return {
    agreements,
    periods,
    addAgreement,
    updateAgreement,
    deleteAgreement,
    addPeriod,
    updatePeriod,
  }
}
