import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, BookOpen, Lightbulb, Brain, Zap, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { aiApi } from '../api/endpoints'

type AIMode = 'explain' | 'quiz' | 'flashcards' | 'summary'

const MODES: { key: AIMode; label: string; icon: JSX.Element; placeholder: string; color: string }[] = [
  { key: 'explain',    label: 'Объяснить',   icon: <Lightbulb size={15} />, placeholder: 'Объясни мне закон Ньютона простыми словами...', color: 'text-yellow-400' },
  { key: 'quiz',       label: 'Тест',        icon: <Brain size={15} />,     placeholder: 'Создай 5 вопросов по теме фотосинтеза...', color: 'text-blue-400' },
  { key: 'flashcards', label: 'Карточки',    icon: <BookOpen size={15} />,  placeholder: 'Сделай флеш-карточки по теме интегралов...', color: 'text-purple-400' },
  { key: 'summary',    label: 'Саммари',     icon: <Zap size={15} />,       placeholder: 'Вставь текст, который нужно кратко пересказать...', color: 'text-emerald-400' },
]

interface Message { role: 'user' | 'ai'; content: string; mode?: AIMode }

export default function AIPage() {
  const [mode, setMode] = useState<AIMode>('explain')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text, mode }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await aiApi.ask({ prompt: text, type: mode })
      setMessages(m => [...m, { role: 'ai', content: res.data.response, mode }])
    } catch {
      toast.error('Ошибка AI. Проверь подключение.')
      setMessages(m => [...m, { role: 'ai', content: '⚠️ Не удалось получить ответ. Попробуй снова.', mode }])
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const currentMode = MODES.find(m => m.key === mode)!

  const renderContent = (content: string) => {
    return content
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold dark:text-white text-slate-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded dark:bg-white/10 bg-slate-100 text-xs font-mono dark:text-indigo-300 text-indigo-600">$1</code>')
      .replace(/^#{1,3} (.+)$/gm, '<div class="font-bold dark:text-white text-slate-900 text-base mt-3 mb-1">$1</div>')
      .replace(/^[-•] (.+)$/gm, '<div class="ml-4 flex gap-2 py-0.5"><span class="text-indigo-400 flex-shrink-0">•</span><span>$1</span></div>')
      .replace(/^(\d+)\. (.+)$/gm, '<div class="ml-4 flex gap-2 py-0.5"><span class="text-indigo-400 font-bold flex-shrink-0">$1.</span><span>$2</span></div>')
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold dark:text-white text-slate-900">AI Помощник</h1>
            <p className="text-xs dark:text-white/40 text-slate-500">Объяснения, тесты, карточки, саммари</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="text-xs dark:text-white/30 text-slate-400 hover:dark:text-white/60 transition">
            Очистить
          </button>
        )}
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 dark:bg-white/[0.04] bg-slate-100 p-1 rounded-xl mb-4">
        {MODES.map(m => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === m.key
                ? 'dark:bg-white/10 bg-white shadow-sm dark:text-white text-slate-900'
                : 'dark:text-white/40 text-slate-500'
            }`}>
            <span className={mode === m.key ? m.color : ''}>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 dark:text-white/20 text-slate-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
              <Sparkles size={28} className="text-indigo-400 opacity-60" />
            </div>
            <div className="text-center">
              <p className="font-semibold dark:text-white/30 text-slate-400 text-sm">Спроси что-нибудь</p>
              <p className="text-xs mt-1 dark:text-white/20 text-slate-300">Режим: <span className={currentMode.color}>{currentMode.label}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {['Объясни теорему Пифагора', 'Сделай тест по органической химии', 'Карточки: части речи', 'Кратко перескажи текст'].map(s => (
                <button key={s} onClick={() => setInput(s)}
                  className="text-left p-3 rounded-xl dark:bg-white/[0.04] bg-slate-50 text-xs dark:text-white/40 text-slate-500 dark:hover:bg-white/[0.07] hover:bg-slate-100 transition border dark:border-white/[0.06] border-slate-100">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={13} className="text-white" />
              </div>
            )}
            <div className={`max-w-[85%] group relative ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'dark:bg-white/[0.06] bg-slate-100 dark:text-white/80 text-slate-700 rounded-tl-sm'
              }`}>
                {msg.role === 'ai' ? (
                  <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                ) : msg.content}
              </div>
              {msg.role === 'ai' && (
                <button onClick={() => copy(msg.content, idx)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg dark:bg-white/10 bg-slate-200">
                  {copiedIdx === idx ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} className="dark:text-white/40 text-slate-400" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={13} className="text-white" />
            </div>
            <div className="dark:bg-white/[0.06] bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="dark:bg-white/[0.04] bg-slate-50 rounded-2xl border dark:border-white/[0.06] border-slate-200 p-3">
        <textarea
          className="w-full bg-transparent outline-none text-sm dark:text-white text-slate-800 resize-none leading-relaxed dark:placeholder:text-white/25 placeholder:text-slate-400"
          rows={3}
          placeholder={currentMode.placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] dark:text-white/20 text-slate-400">Enter — отправить · Shift+Enter — новая строка</span>
          <button onClick={send} disabled={!input.trim() || loading}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              input.trim() && !loading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'dark:bg-white/[0.06] bg-slate-200 dark:text-white/30 text-slate-400 cursor-not-allowed'
            }`}>
            <Send size={13} /> Отправить
          </button>
        </div>
      </div>
    </div>
  )
}
