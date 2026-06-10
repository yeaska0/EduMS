import { Sun, Moon, Globe } from 'lucide-react'
import { useUiStore } from '../store/uiStore'
import { useT } from '../hooks/useT'
import clsx from 'clsx'

const LANGS = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'kz', label: 'Қазақша', flag: '🇰🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const

export default function SettingsPage() {
  const tFn = useT()
  const { lang, setLang, theme, setTheme } = useUiStore()

  return (
    <div className="max-w-xl space-y-6">
      {/* Language */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-white/70 flex items-center gap-2 uppercase tracking-wide">
          <Globe size={14} /> {tFn('language')}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={clsx(
                'flex flex-col items-center gap-2 py-4 rounded-xl border transition',
                lang === l.code
                  ? 'bg-[#6c63ff]/20 border-[#6c63ff] text-white'
                  : 'bg-white/[0.03] border-white/[0.07] text-white/50 hover:text-white hover:border-white/20'
              )}
            >
              <span className="text-2xl">{l.flag}</span>
              <span className="text-xs font-medium">{l.label}</span>
              {lang === l.code && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-white/70 flex items-center gap-2 uppercase tracking-wide">
          <Sun size={14} /> {tFn('theme')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'dark', label: tFn('darkTheme'), icon: Moon },
            { value: 'light', label: tFn('lightTheme'), icon: Sun },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value as 'dark' | 'light')}
              className={clsx(
                'flex items-center gap-3 p-4 rounded-xl border transition',
                theme === value
                  ? 'bg-[#6c63ff]/20 border-[#6c63ff] text-white'
                  : 'bg-white/[0.03] border-white/[0.07] text-white/50 hover:text-white hover:border-white/20'
              )}
            >
              <div className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center',
                theme === value ? 'bg-[#6c63ff]/30' : 'bg-white/5'
              )}>
                <Icon size={18} />
              </div>
              <div>
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-white/30">{value === 'dark' ? '#111326' : '#f0f4f8'}</div>
              </div>
              {theme === value && (
                <div className="ml-auto w-4 h-4 rounded-full bg-[#6c63ff] flex items-center justify-center">
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">О системе</h2>
        <div className="flex flex-col gap-2 text-sm">
          {[
            ['Система', 'EduMS — Student Management'],
            ['Версия', '2.0.0'],
            ['Backend', 'Spring Boot 3 · Java 21'],
            ['Frontend', 'React 18 · TypeScript · Vite'],
            ['База данных', 'PostgreSQL'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b border-white/[0.05] last:border-0">
              <span className="text-white/40">{k}</span>
              <span className="text-white/70 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
