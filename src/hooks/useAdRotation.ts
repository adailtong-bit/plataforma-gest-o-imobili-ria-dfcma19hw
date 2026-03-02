import { useState, useEffect } from 'react'
import { Advertisement } from '@/lib/types'

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

    // Initial shuffle
    const shuffled = [...ads].sort(() => 0.5 - Math.random())
    setVisibleAds(shuffled.slice(0, displayCount))

    const interval = setInterval(() => {
      setVisibleAds((current) => {
        const nextAds = [...ads].filter(
          (a) => !current.find((c) => c.id === a.id),
        )
        const candidates =
          nextAds.length >= displayCount ? nextAds : [...nextAds, ...current]
        const nextShuffled = candidates
          .sort(() => 0.5 - Math.random())
          .slice(0, displayCount)
        return nextShuffled
      })
    }, rotationIntervalSeconds * 1000)

    return () => clearInterval(interval)
  }, [ads, displayCount, rotationIntervalSeconds])

  return visibleAds
}
