import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

let globalOwners: any[] = []
let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

export const fetchOwners = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'property_owner')
  if (data) {
    globalOwners = data
    notify()
  }
}

fetchOwners()

const useOwnerStore = () => {
  const [owners, setOwners] = useState<any[]>(globalOwners)

  useEffect(() => {
    const l = () => setOwners(globalOwners)
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const addOwner = async (owner: any) => {}

  const updateOwner = async (owner: any) => {
    await supabase
      .from('profiles')
      .update({ name: owner.name })
      .eq('id', owner.id)
    await fetchOwners()
  }

  return { owners, addOwner, updateOwner }
}

export default useOwnerStore
