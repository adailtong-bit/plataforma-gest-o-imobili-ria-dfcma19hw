import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useLanguageStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useLanguageStore must be used within AppProvider')

  return {
    language: context.language,
    setLanguage: context.setLanguage,
    t: context.t,
  }
}

export default useLanguageStore
