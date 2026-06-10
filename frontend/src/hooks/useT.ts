import { useUiStore } from '../store/uiStore'
import { t, type TranslationKey } from '../i18n'

export function useT() {
  const lang = useUiStore(s => s.lang)
  return (key: TranslationKey) => t(lang, key)
}
