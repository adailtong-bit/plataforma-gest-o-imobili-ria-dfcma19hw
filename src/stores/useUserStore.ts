import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

let globalProfiles: any[] = []
let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

export const fetchProfiles = async () => {
  const { data } = await supabase.from('profiles').select('*')
  if (data) {
    globalProfiles = data
    notify()
  }
}

fetchProfiles()

const useUserStore = () => {
  const [profiles, setProfiles] = useState<any[]>(globalProfiles)

  useEffect(() => {
    const l = () => setProfiles(globalProfiles)
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const addProfile = async (profile: any) => {
    // In a real app, you would call an edge function to create auth user.
    // For demo/audit, we just insert into profiles if needed.
    const { error } = await supabase.from('profiles').insert(profile)
    if (!error) await fetchProfiles()
    else console.error('Error adding profile:', error)
  }

  const updateProfile = async (profile: any) => {
    const { error } = await supabase
      .from('profiles')
      .update({ name: profile.name, role: profile.role })
      .eq('id', profile.id)
    if (!error) await fetchProfiles()
  }

  const deleteProfile = async (id: string) => {
    // Deleting from profiles might fail if auth.users still exists, but we have ON DELETE CASCADE from auth.users, not the other way around.
    // For demo, we just try.
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (!error) await fetchProfiles()
  }

  return {
    profiles,
    addProfile,
    updateProfile,
    deleteProfile,
  }
}

export default useUserStore
