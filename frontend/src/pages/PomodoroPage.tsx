import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, Coffee, CheckCircle2, Flame, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { pomodoroApi, tasksApi } from '../api/endpoints'
import type { Task } from '../types'

type Mode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK'

const MODE_CONFIG: Record<Mode, { label: string; minutes: number; color: string; bg: string }> = {
  WORK:        { label: 'Фокус',          minutes: 25, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  SHORT_BREAK: { label: 'Короткий перерыв', minutes: 5,  color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  LONG_BREAK:  { label: 'Длинный перерыв', minutes: 15, color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
}

export default function PomodoroPage() {
  const [mode, setMode] = useState<Mode>('WORK')
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [completedTotal, setCompletedTotal] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [history, setHistory] = useState<{ taskTitle?: string; duration: number; completedAt: Date }[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cfg = MODE_CONFIG[mode]

  useEffect(() => {
    Promise.all([
      pomodoroApi.stats().then(r => setCompletedTotal(r.data.completed)),
      tasksApi.list().then(r => setTasks(r.data.filter(t => t.status !== 'DONE'))),
    ])
  }, [])

  useEffect(() => {
    setSecondsLeft(cfg.minutes * 60)
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [mode])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            handleComplete()
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const handleComplete = async () => {
    const isWork = mode === 'WORK'
    if (isWork) {
      const newSessions = sessions + 1
      setSessions(newSessions)
      setCompletedTotal(c => c + 1)
      setHistory(h => [{ taskTitle: selectedTask?.title, duration: cfg.minutes, completedAt: new Date() }, ...h.slice(0, 9)])
      toast.success('🎉 Помидор завершён! Молодец!', { duration: 4000 })
      try {
        await pomodoroApi.save({ taskId: selectedTask?.id, durationMinutes: cfg.minutes, completed: true })
      } catch {}
      if (newSessions % 4 === 0) { setMode('LONG_BREAK') } else { setMode('SHORT_BREAK') }
    } else {
      setMode('WORK')
      toast('☕ Перерыв окончен — время фокусироваться!', { icon: '⚡' })
    }
  }

  const reset = () => {
    setRunning(false)
    setSecondsLeft(cfg.minutes * 60)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = 1 - secondsLeft / (cfg.minutes * 60)
  const circumference = 2 * Math.PI * 120

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold dark:text-white text-slate-900">Помидор</h1>
        <p className="text-sm dark:text-white/40 text-slate-500 mt-0.5">Техника Pomodoro для глубокого фокуса</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-1 dark:bg-white/[0.04] bg-slate-100 p-1 rounded-xl justify-center">
        {(Object.keys(MODE_CONFIG) as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === m ? 'bg-white dark:bg-white/10 shadow-sm dark:text-white text-slate-900' : 'dark:text-white/40 text-slate-500'
            }`}>
            {MODE_CONFIG[m].label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="280" height="280" className="-rotate-90">
            <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle cx="140" cy="140" r="120" fill="none"
              stroke={cfg.color} strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-black tabular-nums tracking-tight dark:text-white text-slate-900">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-sm font-semibold mt-1" style={{ color: cfg.color }}>{cfg.label}</div>
            <div className="text-xs dark:text-white/30 text-slate-400 mt-1"># {sessions + 1}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-4">
          <button onClick={reset} className="w-10 h-10 rounded-full dark:bg-white/[0.06] bg-slate-100 flex items-center justify-center dark:text-white/40 text-slate-400 dark:hover:bg-white/10 transition">
            <RotateCcw size={16} />
          </button>
          <button onClick={() => setRunning(r => !r)}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition hover:scale-105 active:scale-95"
            style={{ background: cfg.color, boxShadow: `0 8px 24px ${cfg.color}40` }}>
            {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <button onClick={handleComplete} className="w-10 h-10 rounded-full dark:bg-white/[0.06] bg-slate-100 flex items-center justify-center dark:text-white/40 text-slate-400 dark:hover:bg-white/10 transition">
            <CheckCircle2 size={16} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <div className="text-2xl font-black dark:text-white text-slate-900">{sessions}</div>
          <div className="text-xs dark:text-white/40 text-slate-500 mt-0.5">Сегодня</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-2xl font-black text-indigo-400">{completedTotal}</div>
          <div className="text-xs dark:text-white/40 text-slate-500 mt-0.5">Всего</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
            <Flame size={20} /> {Math.floor(sessions * 25 / 60)}ч
          </div>
          <div className="text-xs dark:text-white/40 text-slate-500 mt-0.5">Сфокусировано</div>
        </div>
      </div>

      {/* Task selector */}
      {tasks.length > 0 && (
        <div className="card">
          <div className="text-xs font-semibold dark:text-white/40 text-slate-500 uppercase tracking-wider mb-3">Над чем работаю</div>
          <div className="space-y-1.5">
            {tasks.slice(0, 5).map(t => (
              <button key={t.id} onClick={() => setSelectedTask(prev => prev?.id === t.id ? null : t)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition border text-sm
                  ${selectedTask?.id === t.id
                    ? 'border-indigo-500/40 dark:bg-indigo-500/10 bg-indigo-50 dark:text-white text-indigo-700'
                    : 'dark:border-white/[0.06] border-slate-100 dark:text-white/60 text-slate-600 dark:hover:bg-white/[0.04] hover:bg-slate-50'}`}>
                <BookOpen size={13} className={selectedTask?.id === t.id ? 'text-indigo-400' : 'dark:text-white/30 text-slate-300'} />
                <span className="truncate font-medium">{t.title}</span>
                {t.dueDate && <span className="ml-auto text-[10px] dark:text-white/25 text-slate-400 flex-shrink-0">{new Date(t.dueDate).toLocaleDateString('ru-RU', { day:'numeric', month:'short' })}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      {history.length > 0 && (
        <div className="card">
          <div className="text-xs font-semibold dark:text-white/40 text-slate-500 uppercase tracking-wider mb-3">История сессий</div>
          <div className="space-y-1.5">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs dark:text-white/50 text-slate-500">
                <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                <span className="flex-1 truncate">{h.taskTitle || 'Без задачи'}</span>
                <span className="dark:text-white/25 text-slate-400">{h.duration} мин</span>
                <Coffee size={11} className="text-orange-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
