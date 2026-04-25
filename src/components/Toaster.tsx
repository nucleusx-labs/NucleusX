import { useAtom } from '@xstate/store/react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { toasts, toast, type Toast } from '../store/toastStore'

const VARIANT: Record<Toast['variant'], { icBg: string; icFg: string; border: string; Icon: typeof CheckCircle2 }> = {
  success: {
    icBg: 'var(--ncx-gain-bg)',
    icFg: 'var(--ncx-gain)',
    border: 'color-mix(in srgb, var(--ncx-gain) 30%, transparent)',
    Icon: CheckCircle2,
  },
  error: {
    icBg: 'var(--ncx-loss-bg)',
    icFg: 'var(--ncx-loss)',
    border: 'color-mix(in srgb, var(--ncx-loss) 30%, transparent)',
    Icon: AlertCircle,
  },
  info: {
    icBg: 'var(--ncx-info-bg)',
    icFg: 'var(--ncx-info)',
    border: 'color-mix(in srgb, var(--ncx-info) 30%, transparent)',
    Icon: Info,
  },
}

export default function Toaster() {
  const list = useAtom(toasts)

  if (list.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-[120] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {list.map((t) => {
        const v = VARIANT[t.variant]
        const { Icon } = v
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3 pr-2 rounded-2xl"
            style={{
              background: 'var(--ncx-surface)',
              border: `1px solid ${v.border}`,
              boxShadow: 'var(--ncx-shadow-md)',
              animation: 'fadeUp 0.32s var(--ncx-ease-out)',
            }}
          >
            <span
              className="w-8 h-8 rounded-full grid place-items-center shrink-0"
              style={{ background: v.icBg, color: v.icFg }}
            >
              <Icon className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="text-sm font-semibold text-ncx-text">
                {t.message}
              </div>
              {t.description && (
                <div className="mt-0.5 ncx-num text-[11px] text-ncx-text-muted break-all">
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 p-1.5 rounded-full text-ncx-text-subtle hover:text-ncx-text hover:bg-ncx-wash transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
