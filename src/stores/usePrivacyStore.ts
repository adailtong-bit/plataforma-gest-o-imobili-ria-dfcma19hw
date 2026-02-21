import { useState, useEffect } from 'react'

let privacyEnabled = false
const listeners = new Set<(val: boolean) => void>()

export const togglePrivacy = () => {
  privacyEnabled = !privacyEnabled
  listeners.forEach((l) => l(privacyEnabled))
}

export const setPrivacy = (val: boolean) => {
  privacyEnabled = val
  listeners.forEach((l) => l(privacyEnabled))
}

export const usePrivacyStore = () => {
  const [isPrivate, setIsPrivate] = useState(privacyEnabled)

  useEffect(() => {
    listeners.add(setIsPrivate)
    return () => {
      listeners.delete(setIsPrivate)
    }
  }, [])

  return { isPrivate, togglePrivacy, setPrivacy }
}

export default usePrivacyStore
