import { useTranslationContext } from '@/hooks/use-db-translations'

const useLanguageStore = () => {
  const context = useTranslationContext()

  return {
    language: context.locale,
    setLanguage: context.changeLanguage,
    t: context.t,
  }
}

export default useLanguageStore
