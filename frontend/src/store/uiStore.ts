import { create } from 'zustand'

type Lang = 'ru' | 'kz' | 'en'
type Theme = 'dark' | 'light'

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface UiState {
  lang: Lang
  theme: Theme
  setLang: (lang: Lang) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  lang: (localStorage.getItem('lang') as Lang) || 'ru',
  theme: (localStorage.getItem('theme') as Theme) || 'dark',

  setLang: (lang) => {
    localStorage.setItem('lang', lang)
    set({ lang })
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    applyTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    applyTheme(next)
    set({ theme: next })
  },
}))
