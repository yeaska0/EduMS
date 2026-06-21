import { useLocation } from 'react-router-dom'
import { Sun, Moon, Bell } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { useT } from '../../hooks/useT'

const PAGE_KEYS: Record<string, 'dashboard' | 'students' | 'courses' | 'grades' | 'enrollments' | 'profile' | 'settings'> = {
  '/': 'dashboard',
  '/students': 'students',
  '/courses': 'courses',
  '/grades': 'grades',
  '/enrollments': 'enrollments',
  '/profile': 'profile',
  '/settings': 'settings',
}

export default function Header() {
  const { pathname } = useLocation()
  const { theme, toggleTheme, lang, setLang } = useUiStore()
  const tFn = useT()

  const pageKey = PAGE_KEYS[pathname] ?? 'dashboard'

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4
                       border-b border-white/[0.06] dark:bg-[#111326]/80 bg-white/80 backdrop-blur-sm">
      <h1 className="text-lg font-semibold dark:text-white text-slate-900">
        {tFn(pageKey)}
      </h1>

      <div className="flex items-center gap-2">
        {/* Language switcher */}
        {(['ru', 'kz', 'en'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition
              ${lang === l
                ? 'bg-[#6c63ff] text-white'
                : 'dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
          >
            {l}
          </button>
        ))}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications (placeholder) */}
        <button className="relative p-2 rounded-xl dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}
