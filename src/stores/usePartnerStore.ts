import { useContext, useEffect, useState, useMemo } from 'react'
import { AppContext } from '@/stores/AppContext'
import { supabase } from '@/lib/supabase/client'

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
    return merged
  }, [context.partners, dbPartners])

  return {
    partners: unifiedPartners,
    addPartner: context.addPartner,
    updatePartner: context.updatePartner,
  }
}

export default usePartnerStore
