import { useDbTranslations } from '@/hooks/use-db-translations'

export default function useLanguageStore() {
  const { t: originalT, locale, changeLanguage, loading } = useDbTranslations()

  const t = (key: string, defaultValue?: string) => {
    const result = originalT(key)
    if (result === key && defaultValue) return defaultValue
    return result || defaultValue || key
  }

  return {
    t,
    language: locale,
    setLanguage: changeLanguage,
    loading,
  }
}
