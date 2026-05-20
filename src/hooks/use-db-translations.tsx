import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'

// Simple in-memory cache to avoid repeated queries
let globalTranslationsCache: Record<string, Record<string, string>> | null =
  null

export function useDbTranslations() {
  const { currentUser, setCurrentUser } = useAuthStore()
  const { toast } = useToast()
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [locale, setLocale] = useState<string>('en')
  const [loading, setLoading] = useState(true)

  // Fetch user's language preference
  useEffect(() => {
    const lang = (currentUser as any)?.language_preference
    if (lang && lang !== locale) {
      setLocale(lang)
    } else if (currentUser?.id && !lang) {
      const fetchUserLang = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('language_preference')
          .eq('id', currentUser.id)
          .single()

        if (data?.language_preference) {
          setLocale(data.language_preference)

          // Sync with global store if needed
          if (setCurrentUser) {
            setCurrentUser({
              ...currentUser,
              language_preference: data.language_preference,
            } as any)
          }
        }
      }
      fetchUserLang()
    }
  }, [currentUser, locale, setCurrentUser])

  // Load translations from DB
  useEffect(() => {
    let isMounted = true

    const loadTranslations = async () => {
      setLoading(true)

      if (!globalTranslationsCache) {
        const { data } = await supabase
          .from('ui_translations')
          .select('key, locale, value')
        if (data) {
          const grouped: Record<string, Record<string, string>> = {}
          data.forEach((t) => {
            if (!grouped[t.locale]) grouped[t.locale] = {}
            grouped[t.locale][t.key] = t.value
          })
          globalTranslationsCache = grouped
        } else {
          globalTranslationsCache = {}
        }
      }

      if (!isMounted) return

      const currentLangMap = globalTranslationsCache[locale] || {}
      const fallbackMap = globalTranslationsCache['en'] || {}

      const merged = { ...fallbackMap, ...currentLangMap }
      setTranslations(merged)
      setLoading(false)
    }

    loadTranslations()

    return () => {
      isMounted = false
    }
  }, [locale])

  const t = useCallback(
    (key: string, fallback?: string) => {
      return translations[key] || fallback || key
    },
    [translations],
  )

  const changeLanguage = async (newLocale: string) => {
    setLocale(newLocale)
    if (currentUser?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ language_preference: newLocale } as any)
        .eq('id', currentUser.id)

      if (!error && setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          language_preference: newLocale,
        } as any)
        toast({
          title: t('toast_lang_updated', 'Language updated'),
          description: t(
            'toast_lang_saved',
            'Your language preference has been saved.',
          ),
        })
      }
    }
  }

  return { t, locale, changeLanguage, loading }
}
