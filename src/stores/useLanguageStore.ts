import { useDbTranslations } from '@/hooks/use-db-translations'

export default function useLanguageStore() {
  const { t, locale, changeLanguage, loading } = useDbTranslations()
  return {
    t,
    language: locale,
    setLanguage: changeLanguage,
    loading,
  }
}
