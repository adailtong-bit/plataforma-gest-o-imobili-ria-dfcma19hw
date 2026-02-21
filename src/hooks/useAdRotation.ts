import { useState, useEffect } from 'react'
import { Advertisement } from '@/lib/types'

export function useAdRotation(
  ads: Advertisement[],
  limit: number = 1,
  intervalSeconds: number = 8,
) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // If we don't have enough ads to rotate, just reset index and do nothing
    if (!ads || ads.length <= limit) {
      setCurrentIndex(0)
      return
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + limit) % ads.length)
    }, intervalSeconds * 1000)

    return () => clearInterval(timer)
  }, [ads, limit, intervalSeconds])

  if (!ads || ads.length === 0) return []

  // If we have fewer ads than the limit, return them all
  if (ads.length <= limit) return ads

  // Return the current slice of ads
  const visibleAds = []
  for (let i = 0; i < limit; i++) {
    visibleAds.push(ads[(currentIndex + i) % ads.length])
  }

  return visibleAds
}
