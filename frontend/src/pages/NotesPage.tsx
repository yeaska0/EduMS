import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Pin, Trash2, BookOpen, Tag, Edit3, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { notesApi, coursesApi } from '../api/endpoints'
import type { Note, Course } from '../types'

const EMPTY_FORM = { title: '', content: '', courseId: '', tags: '', pinned: false }

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Note | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  const load = useCallback(async (q?: string) => {
    try {
      const [nRes, cRes] = await Promise.all([notesApi.list(q), coursesApi.list(0, 100)])
      setNotes(nRes.data)
      setCourses(cRes.data.content)
    } catch { toast.error('Ошибка загрузки') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300)
    return () => clearTimeout(t)
  }, [search, load])

  const openCreate = () => {
    setEditing(null); setForm(EMPTY_FORM); setSelected(null); setShowEditor(true); setPreview(false)
  }
  const openEdit = (n: Note) => {
    setEditing(n)
    setForm({ title: n.title, content: n.content || '', courseId: n.courseId ? String(n.courseId) : '', tags: n.tags || '', pinned: n.pinned })
    setSelected(n); setShowEditor(true); setPreview(false)
  }

  const save = async () => {
    if (!form.title.trim()) return toast.error('Введите заголовок')
    setSaving(true)
    try {
      const payload = { title: form.title, content: form.content, courseId: form.courseId ? Number(form.courseId) : undefined, tags: form.tags || undefined, pinned: form.pinned }
      if (editing) { await notesApi.update(editing.id, payload) } else { await notesApi.create(payload) }
      toast.success('Сохранено'); setShowEditor(false); load()
    } catch { toast.error('Ошибка') }
    finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    try { await notesApi.delete(id); toast.success('Удалено'); if (selected?.id === id) { setSelected(null); setShowEditor(false) }; load() }
    catch { toast.error('Ошибка') }
  }

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-4 mb-1 dark:text-white text-slate-900">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-5 mb-2 dark:text-white text-slate-900">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-2 dark:text-white text-slate-900">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold dark:text-white text-slate-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded dark:bg-white/10 bg-slate-100 text-xs font-mono dark:text-indigo-300 text-indigo-600">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc dark:text-white/70 text-slate-600 text-sm py-0.5">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal dark:text-white/70 text-slate-600 text-sm py-0.5">$2</li>')
      .replace(/\n\n/g, '</p><p class="my-3">')
      .replace(/\n/g, '<br/>')
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* Sidebar — notes list */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white/30 text-slate-400" />
            <input className="input w-full pl-9 py-2 text-sm" placeholder="Поиск..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={openCreate} className="btn-primary px-3"><Plus size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {loading ? (
            <div className="text-center py-8 dark:text-white/30 text-slate-400 text-sm">Загрузка...</div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 dark:text-white/30 text-slate-400 text-sm">Заметок нет</div>
          ) : notes.map(n => (
            <div key={n.id}
              onClick={() => { setSelected(n); openEdit(n) }}
              className={`p-3 rounded-xl cursor-pointer transition group border
                ${selected?.id === n.id
                  ? 'dark:bg-indigo-500/15 bg-indigo-50 border-indigo-500/30'
                  : 'dark:hover:bg-white/[0.04] hover:bg-slate-50 dark:border-white/[0.06] border-slate-100'
                }`}>
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {n.pinned && <Pin size={10} className="text-indigo-400 flex-shrink-0" />}
                  <span className="text-sm font-semibold dark:text-white text-slate-800 truncate">{n.title}</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition flex-shrink-0 p-0.5 rounded dark:hover:bg-red-400/10"
                  onClick={e => { e.stopPropagation(); remove(n.id) }}>
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
              {n.content && <p className="text-xs dark:text-white/40 text-slate-500 mt-1 line-clamp-2 leading-relaxed">{n.content.replace(/[#*`]/g, '').slice(0, 80)}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] dark:text-white/25 text-slate-400">{formatDate(n.updatedAt)}</span>
                {n.courseName && <span className="text-[10px] dark:text-indigo-400/60 text-indigo-500 flex items-center gap-0.5"><BookOpen size={8} />{n.courseName}</span>}
              </div>
              {n.tags && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {n.tags.split(',').slice(0, 3).map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-md dark:bg-white/[0.06] bg-slate-100 dark:text-white/40 text-slate-500">#{t.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor pane */}
      {showEditor ? (
        <div className="flex-1 card flex flex-col overflow-hidden p-0">
          {/* Editor toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 dark:border-b dark:border-white/[0.06] border-b border-slate-100">
            <input className="flex-1 text-lg font-bold dark:text-white text-slate-900 bg-transparent outline-none placeholder:dark:text-white/20 placeholder:text-slate-300"
              placeholder="Заголовок заметки..." value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <div className="flex items-center gap-1">
              <button onClick={() => setPreview(p => !p)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${preview ? 'dark:bg-indigo-500/20 text-indigo-400' : 'dark:text-white/30 text-slate-400 dark:hover:text-white/60'}`}>
                {preview ? 'Редактор' : 'Превью'}
              </button>
              <button onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))}
                className={`p-1.5 rounded-lg transition ${form.pinned ? 'text-indigo-400 dark:bg-indigo-500/15' : 'dark:text-white/30 text-slate-400'}`}>
                <Pin size={14} />
              </button>
              <button onClick={save} disabled={saving} className="btn-primary text-xs px-3 py-1.5">
                {saving ? '...' : 'Сохранить'}
              </button>
              <button onClick={() => setShowEditor(false)} className="p-1.5 dark:text-white/30 text-slate-400 dark:hover:text-white/60">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 px-4 py-2 dark:border-b dark:border-white/[0.04] border-b border-slate-50 flex-wrap">
            <select className="select text-xs py-1 w-40" value={form.courseId}
              onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}>
              <option value="">— Курс —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex items-center gap-1.5 flex-1">
              <Tag size={11} className="dark:text-white/30 text-slate-400" />
              <input className="text-xs dark:text-white/60 text-slate-600 bg-transparent outline-none placeholder:dark:text-white/20 flex-1"
                placeholder="тег1, тег2, тег3" value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
          </div>

          {/* Markdown helper */}
          <div className="flex gap-2 px-4 py-1.5 dark:border-b dark:border-white/[0.04] border-b border-slate-50 flex-wrap">
            {[['**B**','**текст**'],['*I*','*текст*'],['`C`','`код`'],['H1','# '],['H2','## '],['- L','- ']].map(([label, insert]) => (
              <button key={label} className="text-[10px] font-bold px-1.5 py-0.5 rounded dark:bg-white/[0.06] bg-slate-100 dark:text-white/40 text-slate-500 dark:hover:text-white/70 hover:text-slate-700 transition font-mono">
                {label}
              </button>
            ))}
          </div>

          {/* Editor / Preview */}
          <div className="flex-1 overflow-auto">
            {preview ? (
              <div className="p-6 prose-sm dark:text-white/70 text-slate-600 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ __html: '<p>' + renderMarkdown(form.content) + '</p>' }} />
            ) : (
              <textarea
                className="w-full h-full p-6 bg-transparent outline-none resize-none text-sm dark:text-white/80 text-slate-700 leading-relaxed font-mono dark:placeholder:text-white/20 placeholder:text-slate-300"
                placeholder={`# Заголовок\n\nПишите заметки в Markdown...\n\n**жирный**, *курсив*, \`код\`\n\n- элемент списка\n- другой элемент`}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center dark:text-white/20 text-slate-300">
          <div className="text-center">
            <Edit3 size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Выберите заметку или создайте новую</p>
          </div>
        </div>
      )}
    </div>
  )
}
