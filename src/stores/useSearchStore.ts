import { useState, useEffect } from 'react'

let globalSearchQuery = ''
let listeners: (() => void)[] = []

const notify = () => listeners.forEach((l) => l())

export const setSearchQuery = (query: string) => {
  globalSearchQuery = query
  notify()
}

export default function useSearchStore() {
  const [searchQuery, setQueryState] = useState(globalSearchQuery)

  useEffect(() => {
    const l = () => setQueryState(globalSearchQuery)
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])

  return {
    searchQuery,
    setSearchQuery,
  }
}
