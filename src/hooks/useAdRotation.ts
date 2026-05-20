import { useState, useEffect } from 'react'

export interface Advertisement {
  id: string
  imageUrl?: string
  linkUrl?: string
  tier?: 'gold' | 'silver' | 'standard'
  [key: string]: any
}

export function useAdRotation(
  ads: Advertisement[],
  displayCount: number = 2,
  rotationIntervalSeconds: number = 10,
) {
  const [visibleAds, setVisibleAds] = useState<Advertisement[]>([])

  useEffect(() => {
    if (!ads || ads.length === 0) {
      setVisibleAds([])
      return
    }

    if (ads.length <= displayCount) {
      setVisibleAds(ads)
      return
    }

    const getTierWeight = (ad: Advertisement) => {
      const tier = ad.tier?.toLowerCase() || 'standard'
      if (tier === 'gold') return 3
      if (tier === 'silver') return 2
      return 1
    }

    const sortAds = (adList: Advertisement[]) => {
      return [...adList].sort((a, b) => {
        const weightDiff = getTierWeight(b) - getTierWeight(a)
        if (weightDiff !== 0) return weightDiff
        return 0.5 - Math.random() // fallback to random within same tier
      })
    }

    // Initial load
    const sorted = sortAds(ads)
    setVisibleAds(sorted.slice(0, displayCount))

    const interval = setInterval(() => {
      setVisibleAds((current) => {
        const nextAds = ads.filter((a) => !current.find((c) => c.id === a.id))
        const candidates =
          nextAds.length >= displayCount ? nextAds : [...nextAds, ...current]

        return sortAds(candidates).slice(0, displayCount)
      })
    }, rotationIntervalSeconds * 1000)

    return () => clearInterval(interval)
  }, [ads, displayCount, rotationIntervalSeconds])

  return visibleAds
}
