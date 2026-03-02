import { useState, useEffect } from 'react'
import {
  SubscriptionTier,
  SubscriptionDiscount,
  PMSpecificPricing,
} from '@/lib/types'

interface SubscriptionConfig {
  tiers: SubscriptionTier[]
  discounts: SubscriptionDiscount[]
  pmOverrides: PMSpecificPricing[]
}

const defaultConfig: SubscriptionConfig = {
  tiers: [
    {
      id: 'tier-1',
      name: 'Essential',
      basePrice: 49,
      maxUnits: 10,
      additionalUnitCost: 2,
      region: 'global',
      features: ['Basic Reporting', 'Up to 10 Properties', 'Standard Support'],
    },
    {
      id: 'tier-2',
      name: 'Professional',
      basePrice: 199,
      maxUnits: 50,
      additionalUnitCost: 1.5,
      region: 'global',
      features: [
        'Advanced Analytics',
        'Up to 50 Properties',
        'Priority Support',
      ],
    },
  ],
  discounts: [
    {
      id: 'disc-1',
      name: 'SUMMER2025',
      type: 'percentage',
      value: 15,
      expiresAt: '2025-08-31',
    },
  ],
  pmOverrides: [],
}

let globalConfig = defaultConfig
const listeners = new Set<() => void>()

const useSubscriptionStore = () => {
  const [subscriptionConfig, setSubscriptionConfig] =
    useState<SubscriptionConfig>(globalConfig)

  useEffect(() => {
    const handler = () => setSubscriptionConfig(globalConfig)
    listeners.add(handler)
    return () => {
      listeners.delete(handler)
    }
  }, [])

  const updateSubscriptionConfig = (newConfig: SubscriptionConfig) => {
    globalConfig = newConfig
    listeners.forEach((listener) => listener())
  }

  return {
    subscriptionConfig,
    updateSubscriptionConfig,
  }
}

export default useSubscriptionStore
