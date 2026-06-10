type Variant = 'green' | 'gray' | 'red' | 'yellow' | 'blue' | 'purple'

interface Props {
  variant?: Variant
  children: React.ReactNode
}

const map: Record<string, Variant> = {
  ACTIVE: 'green', COMPLETED: 'blue', GRADUATED: 'purple',
  INACTIVE: 'gray', DROPPED: 'red', FULL: 'yellow',
  MIDTERM: 'blue', FINAL: 'purple', ASSIGNMENT: 'green',
  QUIZ: 'yellow', PROJECT: 'gray',
}

export function statusVariant(status: string): Variant {
  return map[status] ?? 'gray'
}

export default function Badge({ variant = 'gray', children }: Props) {
  return <span className={`badge-${variant}`}>{children}</span>
}
