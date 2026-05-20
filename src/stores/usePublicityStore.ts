import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

let globalAdvertisers: any[] = []
let globalPricingMatrix: any[] = []
let globalCampaigns: any[] = []
let listeners: (() => void)[] = []

const notify = () => listeners.forEach((l) => l())

const fetchPublicityData = async () => {
  const [advRes, priceRes, campRes] = await Promise.all([
    supabase.from('advertisers').select('*'),
    supabase.from('publicity_pricing_matrix').select('*'),
    supabase.from('publicity_campaigns').select('*'),
  ])

  if (advRes.data) globalAdvertisers = advRes.data
  if (priceRes.data) globalPricingMatrix = priceRes.data
  if (campRes.data) globalCampaigns = campRes.data

  notify()
}

// Fetch on initialization
fetchPublicityData().catch(console.error)

const usePublicityStore = () => {
  const [advertisers, setAdvertisers] = useState<any[]>(globalAdvertisers)
  const [pricingMatrix, setPricingMatrix] = useState<any[]>(globalPricingMatrix)
  const [campaigns, setCampaigns] = useState<any[]>(globalCampaigns)

  useEffect(() => {
    const l = () => {
      setAdvertisers(globalAdvertisers)
      setPricingMatrix(globalPricingMatrix)
      setCampaigns(globalCampaigns)
    }
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const addAdvertiser = async (adv: any) => {
    const dbData = {
      name: adv.name,
      tax_id: adv.taxId,
      billing_email: adv.email,
      billing_phone: adv.phone,
      billing_address: adv.address,
      street: adv.street,
      number: adv.number,
      complement: adv.complement,
      neighborhood: adv.neighborhood,
      city: adv.city,
      state: adv.state,
      zip_code: adv.zipCode,
      country: adv.country,
      contacts: adv.contacts,
    }
    const { error } = await supabase.from('advertisers').insert(dbData)
    if (error) throw error
    await fetchPublicityData()
  }

  const updateAdvertiser = async (adv: any) => {
    const dbData = {
      name: adv.name,
      tax_id: adv.taxId,
      billing_email: adv.email,
      billing_phone: adv.phone,
      billing_address: adv.address,
      street: adv.street,
      number: adv.number,
      complement: adv.complement,
      neighborhood: adv.neighborhood,
      city: adv.city,
      state: adv.state,
      zip_code: adv.zipCode,
      country: adv.country,
      contacts: adv.contacts,
    }
    const { error } = await supabase
      .from('advertisers')
      .update(dbData)
      .eq('id', adv.id)
    if (error) throw error
    await fetchPublicityData()
  }

  const deleteAdvertiser = async (id: string) => {
    const { error } = await supabase.from('advertisers').delete().eq('id', id)
    if (error) throw error
    await fetchPublicityData()
  }

  const addPricingMatrix = async (price: any) => {
    const { error } = await supabase.from('publicity_pricing_matrix').insert({
      location_key: price.location_key,
      duration_days: price.duration_days,
      price: price.price,
      valid_from: price.valid_from,
    })
    if (error) throw error
    await fetchPublicityData()
  }

  const updatePricingMatrix = async (price: any) => {
    const { error } = await supabase
      .from('publicity_pricing_matrix')
      .update({
        location_key: price.location_key,
        duration_days: price.duration_days,
        price: price.price,
        valid_from: price.valid_from,
      })
      .eq('id', price.id)
    if (error) throw error
    await fetchPublicityData()
  }

  const deletePricingMatrix = async (id: string) => {
    const { error } = await supabase
      .from('publicity_pricing_matrix')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchPublicityData()
  }

  const addCampaign = async (camp: any) => {
    const { data, error } = await supabase
      .from('publicity_campaigns')
      .insert({
        title: camp.title,
        advertiser_id: camp.advertiser_id,
        pricing_id: camp.pricing_id,
        start_date: camp.start_date,
        end_date: camp.end_date,
        status: camp.status,
        total_amount: camp.total_amount,
        image_url: camp.image_url,
        link_url: camp.link_url,
      })
      .select()
      .single()

    if (error) throw error
    await fetchPublicityData()
    return data
  }

  const updateCampaign = async (camp: any) => {
    const { data, error } = await supabase
      .from('publicity_campaigns')
      .update({
        title: camp.title,
        advertiser_id: camp.advertiser_id,
        pricing_id: camp.pricing_id,
        start_date: camp.start_date,
        end_date: camp.end_date,
        status: camp.status,
        total_amount: camp.total_amount,
        image_url: camp.image_url,
        link_url: camp.link_url,
        last_notified_at: camp.last_notified_at,
      })
      .eq('id', camp.id)
      .select()
      .single()

    if (error) throw error
    await fetchPublicityData()
    return data
  }

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from('publicity_campaigns')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchPublicityData()
  }

  return {
    advertisers: advertisers.map((a) => ({
      id: a.id,
      name: a.name,
      taxId: a.tax_id,
      email: a.billing_email,
      phone: a.billing_phone,
      address: a.billing_address,
      street: a.street,
      number: a.number,
      complement: a.complement,
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      zipCode: a.zip_code,
      country: a.country,
      contacts: a.contacts || [],
    })),
    addAdvertiser,
    updateAdvertiser,
    deleteAdvertiser,

    pricingMatrix,
    addPricingMatrix,
    updatePricingMatrix,
    deletePricingMatrix,

    campaigns: campaigns.map((c) => ({
      ...c,
      impressions_count: c.impressions_count || 0,
      clicks_count: c.clicks_count || 0,
      last_notified_at: c.last_notified_at || null,
    })),
    addCampaign,
    updateCampaign,
    deleteCampaign,
  }
}

export default usePublicityStore
