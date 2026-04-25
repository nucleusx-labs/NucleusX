import { useEffect, useState } from 'react'

type Phase = 'typing' | 'hold' | 'deleting' | 'gap'

interface TypewriterProps {
  words: string[]
  /** Per-character typing delay (ms). */
  typeMs?: number
  /** Per-character deleting delay (ms). */
  deleteMs?: number
  /** How long to hold the fully-typed word before deleting (ms). */
  holdMs?: number
  /** Pause after the word is fully erased before the next one starts (ms). */
  gapMs?: number
  /** Class applied to the typed text span (e.g. "ncx-shimmer"). */
  className?: string
}

/**
 * Typewriter that types and deletes through `words` on an infinite loop,
 * with a blinking caret at the end. The typed text and caret are siblings
 * (the caret sits outside `className` so e.g. background-clip: text on the
 * shimmer span doesn't swallow the caret fill).
 */
export default function Typewriter({
  words,
  typeMs = 185,
  deleteMs = 120,
  holdMs = 2600,
  gapMs = 760,
  className,
}: TypewriterProps) {
  const [wordIdx, setWordIdx] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>('typing')
  const longestWord = words.reduce((longest, word) => word.length > longest.length ? word : longest, '')

  useEffect(() => {
    const word = words[wordIdx % words.length]
    let id: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (text.length < word.length) {
        id = setTimeout(() => setText(word.slice(0, text.length + 1)), typeMs)
      } else {
        id = setTimeout(() => setPhase('hold'), 0)
      }
    } else if (phase === 'hold') {
      id = setTimeout(() => setPhase('deleting'), holdMs)
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        id = setTimeout(() => setText(word.slice(0, text.length - 1)), deleteMs)
      } else {
        id = setTimeout(() => setPhase('gap'), 0)
      }
    } else {
      id = setTimeout(() => {
        setWordIdx(i => (i + 1) % words.length)
        setPhase('typing')
      }, gapMs)
    }

    return () => clearTimeout(id)
  }, [phase, text, wordIdx, words, typeMs, deleteMs, holdMs, gapMs])

  return (
    <span
      style={{
        display: 'inline-grid',
        verticalAlign: 'baseline',
        lineHeight: '0.92em',
        minHeight: '0.98em',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          gridArea: '1 / 1',
          visibility: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'pre',
          lineHeight: '0.92em',
        }}
      >
        <span className={className}>{longestWord}</span>
        <span
          style={{
            display: 'inline-block',
            width: '0.06em',
            marginLeft: '0.08em',
            height: '0.88em',
          }}
        />
      </span>
      <span
        style={{
          gridArea: '1 / 1',
          display: 'inline-flex',
          alignItems: 'flex-end',
          whiteSpace: 'pre',
          lineHeight: '0.92em',
        }}
      >
        <span
          className={className}
          aria-live="polite"
          style={{
            display: 'inline-block',
            lineHeight: '0.92em',
            textAlign: 'left',
          }}
        >
          {text}
        </span>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '0.06em',
            marginLeft: '0.08em',
            marginRight: '-0.02em',
            height: '0.88em',
            transform: 'translateY(-0.01em)',
            background: 'var(--ncx-purple-300)',
            borderRadius: '1px',
            animation: 'ncx-caret-blink 1.05s steps(2, start) infinite',
          }}
        />
      </span>
    </span>
  )
}
