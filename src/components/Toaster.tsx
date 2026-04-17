import { useAtom } from '@xstate/store/react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { toasts, toast, type Toast } from '../store/toastStore'

const VARIANT_STYLES: Record<Toast['variant'], { border: string; bg: string; text: string; Icon: typeof CheckCircle2 }> = {
  success: {
    border: 'border-[#2D0A5B]',
    bg: 'bg-[#0A0A0A]',
    text: 'text-[#7B3FE4]',
    Icon: CheckCircle2,
  },
  error: {
    border: 'border-red-800',
    bg: 'bg-[#0A0A0A]',
    text: 'text-red-400',
    Icon: AlertCircle,
  },
  info: {
    border: 'border-[#2D0A5B]',
    bg: 'bg-[#0A0A0A]',
    text: 'text-[#A1A1A1]',
    Icon: Info,
  },
}

export default function Toaster() {
  const list = useAtom(toasts)

  if (list.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {list.map((t) => {
        const style = VARIANT_STYLES[t.variant]
        const { Icon } = style
        return (
          <div
            key={t.id}
            className={`pointer-events-auto border ${style.border} ${style.bg} p-3 flex items-start gap-2 shadow-lg`}
            role="status"
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.text}`} />
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
                {t.message}
              </div>
              {t.description && (
                <div className="mt-1 text-xs text-[#A1A1A1] break-all font-mono">
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="shrink-0 text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
