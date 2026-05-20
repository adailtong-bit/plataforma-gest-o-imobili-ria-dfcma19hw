// This file is obsolete. Translations are now loaded from the database via useDbTranslations hook.
// Keeping empty exports to avoid breaking legacy imports.
export type Language = 'pt' | 'en' | 'es'
export const translations: Record<Language, any> = { pt: {}, en: {}, es: {} }
