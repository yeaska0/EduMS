import { useEffect, useState } from 'react'
import { Users, BookOpen, ClipboardList, Award, TrendingUp, Star } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import { dashboardApi } from '../api/endpoints'
import type { DashboardStats } from '../types'
import StatCard from '../components/ui/StatCard'
import { useT } from '../hooks/useT'

const COLORS = ['#6c63ff','#34d399','#f59e0b','#f87171','#60a5fa']

export default function DashboardPage() {
  const tFn = useT()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.stats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={tFn('totalStudents')} value={stats.totalStudents} icon={Users} color="#6c63ff" sub={`${tFn('active')}: ${stats.activeStudents}`} />
        <StatCard label={tFn('totalCourses')} value={stats.totalCourses} icon={BookOpen} color="#34d399" sub={`${tFn('active')}: ${stats.activeCourses}`} />
        <StatCard label={tFn('totalEnrollments')} value={stats.totalEnrollments} icon={ClipboardList} color="#f59e0b" />
        <StatCard label={tFn('averageGpa')} value={stats.averageGpa?.toFixed(2) ?? '—'} icon={TrendingUp} color="#f87171" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Grade distribution bar chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">
            {tFn('gradeDistribution')}
          </h2>
          {stats.gradeDistribution?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.gradeDistribution} barCategoryGap="35%">
                <XAxis dataKey="type" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e2140', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
                />
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {stats.gradeDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-white/20 text-sm">{tFn('noData')}</div>
          )}
        </div>

        {/* Enrollment status pie */}
        <div className="card">
          <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">
            {tFn('enrollments')}
          </h2>
          {stats.enrollmentByStatus?.length ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={stats.enrollmentByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={60} innerRadius={36}>
                    {stats.enrollmentByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e2140', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {stats.enrollmentByStatus.map((d, i) => (
                  <div key={d.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-white/50">{d.status}</span>
                    </div>
                    <span className="text-white/80 font-medium">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-white/20 text-sm">{tFn('noData')}</div>
          )}
        </div>
      </div>

      {/* Top students */}
      {stats.topStudents?.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide flex items-center gap-2">
            <Star size={14} className="text-yellow-400" />
            {tFn('topStudents')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.topStudents.slice(0, 6).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="w-8 h-8 rounded-full bg-[#6c63ff]/20 flex items-center justify-center text-xs font-bold text-[#6c63ff]">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{s.name}</div>
                  <div className="text-white/40 text-xs">GPA: {s.gpa}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
