import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Property } from '@/lib/types'

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
    }))
    notify()
  }
}

fetchProperties()

const usePropertyStore = () => {
  const [properties, setProperties] = useState<Property[]>(globalProperties)

  useEffect(() => {
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
      condominium_id: prop.condominiumId,
      hotel_id: prop.hotelId,
      tower_id: prop.towerId,
      floor: prop.floor,
      room_number: prop.roomNumber,
      status: prop.status,
      image: prop.image,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      guests: prop.guests,
      owner_id: prop.ownerId,
      agent_id: prop.agentId,
      listing_price: prop.listingPrice,
      hoa_value: prop.hoaValue,
    }
    const { error } = await supabase.from('properties').insert(dbProp)
    if (!error) await fetchProperties()
    else console.error(error)
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
      condominium_id: prop.condominiumId,
      hotel_id: prop.hotelId,
      tower_id: prop.towerId,
      floor: prop.floor,
      room_number: prop.roomNumber,
      status: prop.status,
      image: prop.image,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      guests: prop.guests,
      owner_id: prop.ownerId,
      agent_id: prop.agentId,
      listing_price: prop.listingPrice,
      hoa_value: prop.hoaValue,
    }
    const { error } = await supabase
      .from('properties')
      .update(dbProp)
      .eq('id', prop.id)
    if (!error) await fetchProperties()
    else console.error(error)
  }

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (!error) await fetchProperties()
    else console.error(error)
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
