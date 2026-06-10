import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  sub?: string
}

export default function StatCard({ label, value, icon: Icon, color = '#6c63ff', sub }: Props) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value mt-1">{value}</div>
          {sub && <div className="text-xs text-white/30 mt-0.5">{sub}</div>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}22` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  )
}
