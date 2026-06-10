import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPages, totalElements, size, onChange }: Props) {
  if (totalPages <= 1) return null

  const from = page * size + 1
  const to = Math.min((page + 1) * size, totalElements)

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <span className="text-xs text-white/30 dark:text-white/30">
        {from}–{to} / {totalElements}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5
                     disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const p = totalPages <= 7 ? i : i === 0 ? 0 : i === 6 ? totalPages - 1 : page - 2 + i
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition
                ${p === page
                  ? 'bg-[#6c63ff] text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
            >
              {p + 1}
            </button>
          )
        })}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5
                     disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
