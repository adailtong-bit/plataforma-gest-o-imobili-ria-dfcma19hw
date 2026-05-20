import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface AdvertiserContact {
  name?: string
  email?: string
  phone?: string
  role?: string
  [key: string]: unknown
}

export interface Advertiser {
  id: string
  name: string
  tax_id: string | null
  billing_email: string
  billing_phone: string | null
  billing_address: string | null
  street: string | null
  number: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  contacts: AdvertiserContact[] | null
  created_at?: string
}

export interface AdvFormData {
  id?: string
  name?: string
  taxId?: string
  email?: string
  phone?: string
  address?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  contacts?: AdvertiserContact[]
}

export interface PriceFormData {
  id?: string
  location_key?: string
  duration_days?: number
  price?: number
  valid_from?: string
}

export interface CampFormData {
  id?: string
  title?: string
  advertiser_id?: string
  pricing_id?: string
  start_date?: string
  end_date?: string
  status?: string
  total_amount?: number
  image_url?: string
  link_url?: string
  last_notified_at?: string
}

export interface PricingMatrix {
  id: string
  location_key: string
  duration_days: number
  price: number
  valid_from: string
  created_at?: string
}

export interface Campaign {
  id: string
  title: string
  advertiser_id: string | null
  pricing_id: string | null
  start_date: string | null
  end_date: string | null
  status: string | null
  total_amount: number | null
  image_url: string | null
  link_url: string | null
  last_notified_at: string | null
  impressions_count: number | null
  clicks_count: number | null
  created_at?: string
  invoice_status?: string | null
}

export interface PublicityInvoice {
  id: string
  invoice_number?: string
  description?: string
  amount?: number
  status?: string
  date?: string
  created_at?: string
  to_name?: string
  booking_id?: string
}

let globalAdvertisers: Advertiser[] = []
let globalPricingMatrix: PricingMatrix[] = []
let globalCampaigns: Campaign[] = []
let globalInvoices: PublicityInvoice[] = []
let listeners: (() => void)[] = []

const notify = () => listeners.forEach((l) => l())

const fetchPublicityData = async () => {
  // Update expired campaigns before fetching the updated data
  await supabase.rpc('update_expired_campaigns').catch(console.error)

  const [advRes, priceRes, campRes, invRes] = await Promise.all([
    supabase.from('advertisers').select('*'),
    supabase.from('publicity_pricing_matrix').select('*'),
    supabase.from('publicity_campaigns').select('*'),
    supabase
      .from('invoices')
      .select('*')
      .in('type', ['publicity_sale', 'publicity_renewal']),
  ])

  if (advRes.data) {
    globalAdvertisers = advRes.data.map((d) => ({
      id: d.id,
      name: d.name,
      tax_id: d.tax_id,
      billing_email: d.billing_email,
      billing_phone: d.billing_phone,
      billing_address: d.billing_address,
      street: d.street,
      number: d.number,
      complement: d.complement,
      neighborhood: d.neighborhood,
      city: d.city,
      state: d.state,
      zip_code: d.zip_code,
      country: d.country,
      contacts: (d.contacts as AdvertiserContact[]) || [],
      created_at: d.created_at,
    }))
  }

  if (priceRes.data) {
    globalPricingMatrix = priceRes.data.map((d) => ({
      id: d.id,
      location_key: d.location_key,
      duration_days: d.duration_days,
      price: Number(d.price),
      valid_from: d.valid_from || new Date().toISOString(),
      created_at: d.created_at,
    }))
  }

  if (campRes.data && invRes.data) {
    const invoicesData = invRes.data
    globalInvoices = invoicesData.map((inv) => ({
      id: inv.id,
      invoice_number: inv.invoice_number || undefined,
      description: inv.description || undefined,
      amount: Number(inv.amount || 0),
      status: inv.status || undefined,
      date: inv.date || inv.created_at || undefined,
      created_at: inv.created_at || undefined,
      to_name: inv.to_name || undefined,
      booking_id: inv.booking_id || undefined,
    }))

    globalCampaigns = campRes.data.map((c) => {
      const campaignInvoices = invoicesData.filter(
        (i) =>
          i.booking_id === c.id ||
          (i.description && i.description.includes(c.title)),
      )

      campaignInvoices.sort(
        (a, b) =>
          new Date(b.created_at || b.date || 0).getTime() -
          new Date(a.created_at || a.date || 0).getTime(),
      )

      return {
        id: c.id,
        title: c.title,
        advertiser_id: c.advertiser_id,
        pricing_id: c.pricing_id,
        start_date: c.start_date,
        end_date: c.end_date,
        status: c.status,
        total_amount: Number(c.total_amount || 0),
        image_url: c.image_url,
        link_url: c.link_url,
        last_notified_at: c.last_notified_at,
        impressions_count: c.impressions_count || 0,
        clicks_count: c.clicks_count || 0,
        created_at: c.created_at,
        invoice_status:
          campaignInvoices.length > 0 ? campaignInvoices[0].status : null,
      }
    })
  } else if (campRes.data) {
    globalCampaigns = campRes.data.map((c) => ({
      id: c.id,
      title: c.title,
      advertiser_id: c.advertiser_id,
      pricing_id: c.pricing_id,
      start_date: c.start_date,
      end_date: c.end_date,
      status: c.status,
      total_amount: Number(c.total_amount || 0),
      image_url: c.image_url,
      link_url: c.link_url,
      last_notified_at: c.last_notified_at,
      impressions_count: c.impressions_count || 0,
      clicks_count: c.clicks_count || 0,
      created_at: c.created_at,
      invoice_status: null,
    }))
  }

  notify()
}

// Fetch on initialization
void fetchPublicityData().catch(console.error)

const usePublicityStore = () => {
  const [advertisers, setAdvertisers] =
    useState<Advertiser[]>(globalAdvertisers)
  const [pricingMatrix, setPricingMatrix] =
    useState<PricingMatrix[]>(globalPricingMatrix)
  const [campaigns, setCampaigns] = useState<Campaign[]>(globalCampaigns)
  const [invoices, setInvoices] = useState<PublicityInvoice[]>(globalInvoices)

  useEffect(() => {
    const l = () => {
      setAdvertisers(globalAdvertisers)
      setPricingMatrix(globalPricingMatrix)
      setCampaigns(globalCampaigns)
      setInvoices(globalInvoices)
    }
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  const addAdvertiser = async (adv: AdvFormData) => {
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

  const updateAdvertiser = async (adv: AdvFormData) => {
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

  const addPricingMatrix = async (price: PriceFormData) => {
    const { error } = await supabase.from('publicity_pricing_matrix').insert({
      location_key: price.location_key,
      duration_days: price.duration_days,
      price: price.price,
      valid_from: price.valid_from,
    })
    if (error) throw error
    await fetchPublicityData()
  }

  const updatePricingMatrix = async (price: PriceFormData) => {
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

  const addCampaign = async (camp: CampFormData) => {
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

  const updateCampaign = async (camp: CampFormData) => {
    if (!camp.id) throw new Error('Campaign ID is required for update')
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

    invoices,
  }
}

export default usePublicityStore
