import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Property } from '@/lib/types'
import { ENV } from '@/lib/env'
import useAuthStore from '@/stores/useAuthStore'

let globalProperties: Property[] = []
let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

export const fetchProperties = async () => {
  const { data } = await supabase.from('properties').select('*')
  if (data) {
    globalProperties = data.map((p: any) => ({
      ...p,
      zipCode: p.zip_code,
      profileType: p.profile_type,
      condominiumId: p.condominium_id,
      hotelId: p.hotel_id,
      towerId: p.tower_id,
      roomNumber: p.room_number,
      ownerId: p.owner_id,
      agentId: p.agent_id,
      listingPrice: p.listing_price,
      hoaValue: p.hoa_value,
      area: p.area,
      accessCode: p.access_code,
      lockerCode: p.locker_code,
      complement: p.complement,
      internetLink: p.internet_link,
    }))
    notify()
  }
}

const usePropertyStore = () => {
  const [properties, setProperties] = useState<Property[]>(globalProperties)
  const { currentUser, simulationMode, simulationRole, allUsers } =
    useAuthStore()

  useEffect(() => {
    if (currentUser) {
      fetchProperties()
    }
  }, [currentUser])

  useEffect(() => {
    fetchProperties() // Fallback initial fetch
    const l = () => setProperties(globalProperties)
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const addProperty = async (prop: Property) => {
    const dbProp = {
      name: prop.name,
      address: prop.address,
      number: prop.number,
      neighborhood: prop.neighborhood,
      city: prop.city,
      state: prop.state,
      zip_code: prop.zipCode,
      country: prop.country,
      type: prop.type,
      profile_type: prop.profileType,
      community: prop.community,
      condominium_id: prop.condominiumId || null,
      hotel_id: prop.hotelId || null,
      tower_id: prop.towerId || null,
      floor: prop.floor,
      room_number: prop.roomNumber,
      status: prop.status,
      image: prop.image,
      access_code: (prop as any).accessCode || (prop as any).access_code,
      locker_code: (prop as any).lockerCode || (prop as any).locker_code,
      complement: prop.complement || (prop as any).complement,
      internet_link: (prop as any).internetLink || (prop as any).internet_link,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      guests: prop.guests,
      owner_id: prop.ownerId || null,
      agent_id: prop.agentId || null,
      listing_price: prop.listingPrice,
      hoa_value: prop.hoaValue,
      area: prop.area,
    }
    const { data, error } = await supabase
      .from('properties')
      .insert(dbProp)
      .select()
      .single()
    if (!error) await fetchProperties()
    else console.error(error)
    return { data, error }
  }

  const updateProperty = async (prop: Property) => {
    const dbProp = {
      name: prop.name,
      address: prop.address,
      number: prop.number,
      neighborhood: prop.neighborhood,
      city: prop.city,
      state: prop.state,
      zip_code: prop.zipCode,
      country: prop.country,
      type: prop.type,
      profile_type: prop.profileType,
      community: prop.community,
      condominium_id: prop.condominiumId || null,
      hotel_id: prop.hotelId || null,
      tower_id: prop.towerId || null,
      floor: prop.floor,
      room_number: prop.roomNumber,
      status: prop.status,
      image: prop.image,
      access_code: (prop as any).accessCode || (prop as any).access_code,
      locker_code: (prop as any).lockerCode || (prop as any).locker_code,
      complement: prop.complement || (prop as any).complement,
      internet_link: (prop as any).internetLink || (prop as any).internet_link,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      guests: prop.guests,
      owner_id: prop.ownerId || null,
      agent_id: prop.agentId || null,
      listing_price: prop.listingPrice,
      hoa_value: prop.hoaValue,
      area: prop.area,
    }
    const { data, error } = await supabase
      .from('properties')
      .update(dbProp)
      .eq('id', prop.id)
      .select()
      .single()
    if (!error) await fetchProperties()
    else console.error(error)
    return { data, error }
  }

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (!error) await fetchProperties()
    else console.error(error)
    return { error }
  }

  return {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    selectedPropertyId: null,
    setSelectedPropertyId: () => {},
  }
}

export default usePropertyStore
