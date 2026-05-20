import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

// Simple in-memory cache to avoid repeated queries
let globalTranslationsCache: Record<string, Record<string, string>> | null =
  null

interface TranslationContextType {
  t: (key: string, fallback?: string) => string
  locale: string
  changeLanguage: (newLocale: string) => Promise<void>
  loading: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { currentUser, setCurrentUser } = useAuthStore()
  const { toast } = useToast()
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [locale, setLocale] = useState<string>('en')
  const [loading, setLoading] = useState(true)

  // Fetch user's language preference
  useEffect(() => {
    const lang = (currentUser as Record<string, unknown>)
      ?.language_preference as string | undefined
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
            } as Record<string, unknown>)
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
      if (!globalTranslationsCache) {
        setLoading(true)
        const { data, error } = await supabase
          .from('ui_translations')
          .select('key, locale, value')

        if (data && !error) {
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

      // Fallback mechanism: English fills missing keys
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
        .update({ language_preference: newLocale })
        .eq('id', currentUser.id)

      if (!error && setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          language_preference: newLocale,
        } as Record<string, unknown>)
        toast({
          title: t('common.success', 'Success'),
          description: t(
            'toast_lang_saved',
            'Your language preference has been saved.',
          ),
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md space-y-6 flex flex-col items-center animate-in fade-in duration-500">
          <Skeleton className="h-16 w-16 rounded-full shadow-sm" />
          <div className="space-y-3 w-full text-center">
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <TranslationContext.Provider value={{ t, locale, changeLanguage, loading }}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslationContext = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    return {
      t: (key: string, fallback?: string) => fallback || key,
      locale: 'en',
      changeLanguage: async () => {},
      loading: false,
    }
  }
  return context
}

export const useDbTranslations = useTranslationContext
