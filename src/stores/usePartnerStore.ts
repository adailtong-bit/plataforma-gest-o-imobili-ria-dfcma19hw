import { useContext, useEffect, useState, useMemo } from 'react'
import { AppContext } from '@/stores/AppContext'
import { supabase } from '@/lib/supabase/client'
import { Partner } from '@/lib/types'

export const opporjobPartnersMock: any[] = [
  {
    id: 'opporjob-1',
    name: 'John Maintenance',
    companyName: 'John Fixes LLC',
    type: 'General Maintenance',
    entityType: 'individual',
    email: 'john@opporjob.local',
    phone: '+1 555 010 2020',
    cpfCnpj: '',
    address: '100 Service Rd',
    city: 'Orlando',
    state: 'FL',
    zipCode: '32801',
    status: 'active',
    role: 'partner',
    origin: 'opporjob',
    source: 'opporjob',
    tags: ['opporjob'],
    serviceRates: [],
    employees: [],
  },
  {
    id: 'opporjob-2',
    name: 'Pro Cleaners',
    companyName: 'Pro Cleaners Inc',
    type: 'Cleaning',
    entityType: 'company',
    email: 'contact@procleaners.local',
    phone: '+1 555 020 3030',
    cpfCnpj: '',
    address: '200 Clean Ave',
    city: 'Kissimmee',
    state: 'FL',
    zipCode: '34741',
    status: 'active',
    role: 'partner',
    origin: 'opporjob',
    source: 'opporjob',
    tags: ['opporjob'],
    serviceRates: [],
    employees: [],
  },
]

export const opporjobStaffMock = [
  {
    id: 'oj-staff-1',
    name: 'Alice Cleaner',
    role: 'Cleaner',
    email: 'alice@procleaners.local',
    phone: '555-9090',
    source: 'opporjob',
    skills: ['cleaning', 'deep_cleaning'],
  },
  {
    id: 'oj-staff-2',
    name: 'Bob Plumber',
    role: 'Plumber',
    email: 'bob@fixes.local',
    phone: '555-8080',
    source: 'opporjob',
    skills: ['plumbing', 'general_maintenance'],
  },
]

const usePartnerStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('usePartnerStore must be used within AppProvider')

  const [dbPartners, setDbPartners] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchDbPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', [
            'partner',
            'opporjob',
            'promoted_partner',
            'opporjob_partner',
            'promoted',
          ])

        if (data && !error && isMounted) {
          const parsed = data.map((profile) => {
            let source = 'summerpm'
            const tags: string[] = []

            if (
              profile.role?.includes('opporjob') ||
              profile.name?.toLowerCase().includes('opporjob') ||
              profile.email?.toLowerCase().includes('opporjob')
            ) {
              source = 'opporjob'
              tags.push('opporjob')
            } else if (
              profile.role?.includes('promoted') ||
              profile.role === 'partner'
            ) {
              source = 'promoted'
              tags.push('promoted')
            }

            return {
              ...profile,
              source,
              origin: source,
              tags,
              employees: [],
            }
          })
          setDbPartners(parsed)
        }
      } catch (err) {
        console.error('Error fetching partners from DB', err)
      }
    }

    fetchDbPartners()

    return () => {
      isMounted = false
    }
  }, [])

  const unifiedPartners = useMemo(() => {
    const merged = [...context.partners]

    dbPartners.forEach((dbP) => {
      if (!merged.find((p) => p.id === dbP.id)) {
        merged.push(dbP)
      }
    })

    opporjobPartnersMock.forEach((ojP) => {
      if (!merged.find((p) => p.id === ojP.id)) {
        merged.push(ojP)
      }
    })

    return merged
  }, [context.partners, dbPartners])

  const importPartnerIfNeeded = (partnerId: string) => {
    if (!partnerId) return
    const isLocal = context.partners.find((p) => p.id === partnerId)
    if (!isLocal) {
      const opporjobPartner = opporjobPartnersMock.find(
        (p) => p.id === partnerId,
      )
      if (opporjobPartner) {
        context.addPartner({
          ...opporjobPartner,
          source: 'summerpm',
          origin: 'imported_from_opporjob',
          tags: [...(opporjobPartner.tags || []), 'imported'],
        } as Partner)
      }
    }
  }

  return {
    partners: unifiedPartners,
    addPartner: context.addPartner,
    updatePartner: context.updatePartner,
    deletePartner: context.deletePartner,
    importPartnerIfNeeded,
  }
}

export default usePartnerStore
