import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Hotel } from '@/lib/types'
import useAuthStore from '@/stores/useAuthStore'

let globalHotels: Hotel[] = []
let globalTowers: any[] = []
let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

export const fetchHotels = async () => {
  const [hotelsRes, towersRes] = await Promise.all([
    supabase.from('hotels').select('*'),
    supabase.from('towers').select('*'),
  ])
  if (hotelsRes.data) {
    globalHotels = hotelsRes.data.map((h: any) => ({
      ...h,
      managerName: h.manager_name,
      managerPhone: h.manager_phone,
      managerEmail: h.manager_email,
      zipCode: h.zip_code,
    })) as unknown as Hotel[]
  }
  if (towersRes.data) {
    globalTowers = towersRes.data.map((t: any) => ({
      ...t,
      hotelId: t.hotel_id,
    }))
  }
  notify()
}

fetchHotels()

const useHotelStore = () => {
  const [hotels, setHotels] = useState<Hotel[]>(globalHotels)
  const [towers, setTowers] = useState<any[]>(globalTowers)
  const { currentUser } = useAuthStore()

  useEffect(() => {
    if (currentUser) {
      fetchHotels()
    }
  }, [currentUser])

  useEffect(() => {
    const l = () => {
      setHotels(globalHotels)
      setTowers(globalTowers)
    }
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const addHotel = async (hotel: Hotel) => {
    const dbHotel = {
      name: hotel.name,
      manager_name: hotel.managerName,
      manager_phone: hotel.managerPhone,
      manager_email: hotel.managerEmail,
      address: hotel.address,
      number: hotel.number,
      neighborhood: hotel.neighborhood,
      city: hotel.city,
      state: hotel.state,
      zip_code: hotel.zipCode,
      country: hotel.country,
    }
    const { error, data } = await supabase
      .from('hotels')
      .insert(dbHotel)
      .select()
      .single()
    if (!error) {
      await fetchHotels()
      return data
    }
    console.error('Error adding hotel:', error)
    return null
  }

  const updateHotel = async (hotel: Hotel) => {
    const dbHotel = {
      name: hotel.name,
      manager_name: hotel.managerName,
      manager_phone: hotel.managerPhone,
      manager_email: hotel.managerEmail,
      address: hotel.address,
      number: hotel.number,
      neighborhood: hotel.neighborhood,
      city: hotel.city,
      state: hotel.state,
      zip_code: hotel.zipCode,
      country: hotel.country,
    }
    const { error } = await supabase
      .from('hotels')
      .update(dbHotel)
      .eq('id', hotel.id)
    if (!error) await fetchHotels()
  }

  const deleteHotel = async (id: string) => {
    const { error } = await supabase.from('hotels').delete().eq('id', id)
    if (!error) await fetchHotels()
  }

  const addTower = async (tower: any) => {
    const { error } = await supabase
      .from('towers')
      .insert({ hotel_id: tower.hotelId, name: tower.name })
    if (!error) await fetchHotels()
  }

  const updateTower = async (tower: any) => {
    const { error } = await supabase
      .from('towers')
      .update({ name: tower.name })
      .eq('id', tower.id)
    if (!error) await fetchHotels()
  }

  const deleteTower = async (id: string) => {
    const { error } = await supabase.from('towers').delete().eq('id', id)
    if (!error) await fetchHotels()
  }

  return {
    hotels,
    towers,
    addHotel,
    updateHotel,
    deleteHotel,
    addTower,
    updateTower,
    deleteTower,
  }
}

export default useHotelStore
