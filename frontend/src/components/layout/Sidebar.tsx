import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, Award, ClipboardList,
  User, Settings, LogOut, GraduationCap, CalendarCheck, ShieldCheck,
  CheckSquare, Calendar, FileText, Timer, Sparkles
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useT } from '../../hooks/useT'
import { authApi } from '../../api/endpoints'
import clsx from 'clsx'

const NAV = [
  { to: '/', icon: LayoutDashboard, key: 'dashboard' as const, exact: true },
  { to: '/students', icon: Users, key: 'students' as const },
  { to: '/courses', icon: BookOpen, key: 'courses' as const },
  { to: '/grades', icon: Award, key: 'grades' as const },
  { to: '/enrollments', icon: ClipboardList, key: 'enrollments' as const },
  { to: '/attendance', icon: CalendarCheck, label: 'Посещаемость' },
]

const STUDYFLOW_NAV = [
  { to: '/tasks',    icon: CheckSquare, label: 'Задачи' },
  { to: '/calendar', icon: Calendar,    label: 'Расписание' },
  { to: '/notes',    icon: FileText,    label: 'Заметки' },
  { to: '/pomodoro', icon: Timer,       label: 'Помидор' },
  { to: '/ai',       icon: Sparkles,    label: 'AI Помощник' },
]

const ADMIN_NAV = [
  { to: '/users', icon: ShieldCheck, label: 'Пользователи' },
]

const BOTTOM_NAV = [
  { to: '/profile', icon: User, key: 'profile' as const },
  { to: '/settings', icon: Settings, key: 'settings' as const },
]

export default function Sidebar() {
  const tFn = useT()
  const { logout, refreshToken, username, role } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {}
    logout()
    navigate('/login')
  }

  return (
    <aside className="layout-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[#6c63ff] flex items-center justify-center flex-shrink-0">
          <GraduationCap size={20} className="text-white" />
        </div>
        <div>
          <div className="font-bold dark:text-white text-slate-900 text-sm leading-tight">StudyFlow AI</div>
          <div className="text-[10px] dark:text-white/30 text-slate-400 uppercase tracking-wider">Student OS</div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col gap-0.5 py-2 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, key, exact, label }: any) => (
          <NavLink key={to} to={to} end={exact}
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <Icon size={18} />
            <span>{key ? tFn(key) : label}</span>
          </NavLink>
        ))}
        {role === 'ADMIN' && ADMIN_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* StudyFlow AI divider */}
        <div className="mx-3 mt-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t dark:border-white/[0.06] border-slate-200" />
            <span className="text-[9px] font-bold tracking-widest uppercase dark:text-white/20 text-slate-400 flex items-center gap-1">
              <Sparkles size={8} /> StudyFlow
            </span>
            <div className="flex-1 border-t dark:border-white/[0.06] border-slate-200" />
          </div>
        </div>

        {STUDYFLOW_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t dark:border-white/[0.07] border-slate-200 my-2" />

      {/* Bottom nav */}
      <nav className="flex flex-col gap-0.5 pb-2">
        {BOTTOM_NAV.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}
          >
            <Icon size={18} />
            <span>{tFn(key)}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="mx-2 mb-4 p-3 rounded-xl dark:bg-white/[0.04] bg-slate-100 dark:border-white/[0.06] border-slate-200 border">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#6c63ff]/30 flex items-center justify-center text-xs font-bold text-[#6c63ff] uppercase">
            {username?.[0] ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="dark:text-white text-slate-800 text-xs font-medium truncate">{username}</div>
            <div className="dark:text-white/30 text-slate-400 text-[10px] capitalize">{role?.toLowerCase()}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg dark:text-white/40 text-slate-500
                     hover:text-red-400 hover:bg-red-500/10 transition text-xs"
        >
          <LogOut size={14} />
          {tFn('logout')}
        </button>
      </div>
    </aside>
  )
}
