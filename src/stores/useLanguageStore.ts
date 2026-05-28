import { useEffect } from 'react'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function useLanguageStore() {
  const { t: originalT, locale, changeLanguage, loading } = useDbTranslations()
  const { user } = useAuth()

  const t = (key: string, defaultValue?: string) => {
    const result = originalT(key)
    if (result === key && defaultValue) return defaultValue
    return result || defaultValue || key
  }

  const setLanguage = async (newLocale: string) => {
    changeLanguage(newLocale)
    if (user) {
      await supabase
        .from('profiles')
        .update({ language_preference: newLocale })
        .eq('id', user.id)
    }
  }

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('language_preference')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (
            data?.language_preference &&
            data.language_preference !== locale
          ) {
            changeLanguage(data.language_preference)
          }
        })
    }
  }, [user])

  return {
    t,
    language: locale,
    setLanguage,
    loading,
  }
}
