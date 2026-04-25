import {
  Activity,
  ArrowRight,
  BarChart3,
  Droplets,
  Users,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PixelBlast from '../components/ui/PixelBlast'

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold },
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function useCountUp(end: number, active: boolean, ms = 1800) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1)
      setN(Math.floor((1 - (1 - p) ** 3) * end))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, end, ms])
  return n
}

// Drive a --ncx-scroll CSS var for subtle parallax on hero
function useScrollVar() {
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--ncx-scroll', `${window.scrollY}`)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 847, suffix: 'M+', prefix: '$', label: 'Total Value Locked', icon: BarChart3 },
  { value: 124, suffix: 'B+', prefix: '$', label: 'Total Volume', icon: Activity },
  { value: 156, suffix: '+', prefix: '', label: 'Active Pools', icon: Droplets },
  { value: 48, suffix: 'K+', prefix: '', label: 'Traders', icon: Users },
]

const PRODUCTS = [
  {
    title: 'Swap',
    desc: 'Instant token swaps with minimal slippage. Access the deepest liquidity on QF Network.',
    link: '/swap',
    tag: 'Trade',
    accent: 'purple' as const,
  },
  {
    title: 'Liquidity Pools',
    desc: 'Provide liquidity and earn a share of every trade. Multiple fee tiers for any strategy.',
    link: '/pools',
    tag: 'Earn',
    accent: 'gain' as const,
  },
  {
    title: 'Farms',
    desc: 'Stake LP tokens to earn boosted NCL rewards and maximise capital efficiency.',
    link: '/farms',
    tag: 'Yield',
    accent: 'info' as const,
  },
  {
    title: 'Staking',
    desc: 'Lock NCL tokens to earn protocol revenue and participate in on-chain governance.',
    link: '/staking',
    tag: 'Govern',
    accent: 'warn' as const,
  },
]

const STEPS = [
  { n: '01', title: 'Connect', desc: 'Link any Substrate wallet in seconds.' },
  { n: '02', title: 'Choose', desc: 'Swap, pool, farm, or stake — your call.' },
  { n: '03', title: 'Earn', desc: 'Capture fees and rewards. Withdraw anytime.' },
]

const FEATURES = [
  { title: 'Lightning execution', desc: 'Sub-second finality on QF consensus.' },
  { title: 'Audited & immutable', desc: 'Third-party audits, live risk monitoring.' },
  { title: 'Concentrated liquidity', desc: 'Capital-efficient AMM — more fees, less capital.' },
  { title: 'QF-native', desc: 'Substrate accounts, EVM contracts via Revive.' },
  { title: 'Advanced analytics', desc: 'Charts, portfolio, and positions in one view.' },
  { title: 'Permissionless markets', desc: '24/7 on-chain price discovery across all pairs.' },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatItem({ stat, active }: { stat: typeof STATS[0]; active: boolean }) {
  const n = useCountUp(stat.value, active)
  const Icon = stat.icon
  return (
    <div className="flex flex-col items-center text-center py-10 px-6 select-none">
      <Icon className="w-4 h-4 text-ncx-purple-300 mb-3 opacity-70" />
      <span className="text-4xl lg:text-5xl font-semibold tracking-tight text-ncx-text ncx-num">
        {stat.prefix}{n}{stat.suffix}
      </span>
      <span className="ncx-num text-[10px] uppercase tracking-[0.18em] text-ncx-text-subtle mt-2">{stat.label}</span>
    </div>
  )
}

const accentTone = {
  purple: { color: 'var(--ncx-purple-300)', bg: 'var(--ncx-wash)', border: 'color-mix(in srgb, var(--ncx-purple-500) 25%, transparent)' },
  gain: { color: 'var(--ncx-gain)', bg: 'var(--ncx-gain-bg)', border: 'color-mix(in srgb, var(--ncx-gain) 25%, transparent)' },
  info: { color: 'var(--ncx-info)', bg: 'var(--ncx-info-bg)', border: 'color-mix(in srgb, var(--ncx-info) 25%, transparent)' },
  warn: { color: 'var(--ncx-warn)', bg: 'var(--ncx-warn-bg)', border: 'color-mix(in srgb, var(--ncx-warn) 25%, transparent)' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [ready, setReady] = useState(false)
  const statsRef = useInView(0.2)
  const ctaRef = useInView(0.2)
  useScrollVar()

  useEffect(() => {
    const prev = document.title
    document.title = 'NucleusX — A Liquidity Layer That Feels Soft'
    const t = setTimeout(() => setReady(true), 60)
    return () => { clearTimeout(t); document.title = prev }
  }, [])

  const a = (delay: number, name = 'fadeUp') =>
    ready ? `${name} 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s both` : 'none'
  const o = (condition = ready): 0 | undefined => condition ? undefined : 0

  return (
    <div className="full-bleed relative -mt-8 -mb-8">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes ncxBlobFloat {
          0%, 100% { transform: translate(0,0) scale(1); border-radius: 62% 38% 47% 53% / 55% 45% 55% 45%; }
          33%      { transform: translate(20px,-30px) scale(1.05); border-radius: 38% 62% 53% 47% / 45% 55% 45% 55%; }
          66%      { transform: translate(-25px,15px) scale(0.97); border-radius: 52% 48% 38% 62% / 60% 40% 60% 40%; }
        }
        @keyframes ncxRingPulseHero { 0%,100% { opacity:.55; transform:translate(-50%,-50%) scale(1); } 50% { opacity:.2; transform:translate(-50%,-50%) scale(1.05); } }
        @keyframes ncxRingPulseHero2 { 0%,100% { opacity:.35; transform:translate(-50%,-50%) scale(1); } 50% { opacity:.12; transform:translate(-50%,-50%) scale(1.04); } }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════
          HERO — full-bleed
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center min-h-[88vh] overflow-hidden px-4 text-center">
        {/* Ambient — subtle pixel field, no ripple */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <PixelBlast
            variant="circle"
            color="#7B3FE4"
            pixelSize={5}
            patternScale={2.2}
            patternDensity={0.55}
            edgeFade={0.55}
            transparent
            speed={0.18}
            enableRipples={false}
            className="absolute inset-0 opacity-[0.55]"
          />

          {/* Radial wash */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[760px]"
            style={{ background: 'radial-gradient(ellipse at 50% 5%, rgba(123,63,228,.20) 0%, transparent 62%)', filter: 'blur(2px)' }}
          />
          {/* Orbital rings */}
          <div
            className="absolute top-1/2 left-1/2 w-[360px] h-[360px] rounded-full border"
            style={{ borderColor: 'var(--ncx-purple-800)', animation: 'ncxRingPulseHero 4.5s ease-in-out infinite' }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full border"
            style={{ borderColor: 'color-mix(in srgb, var(--ncx-purple-800) 60%, transparent)', animation: 'ncxRingPulseHero2 6s ease-in-out infinite .8s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-[820px] h-[820px] rounded-full border"
            style={{ borderColor: 'color-mix(in srgb, var(--ncx-purple-800) 25%, transparent)', animation: 'ncxRingPulseHero2 7.5s ease-in-out infinite 1.6s' }}
          />

          {/* Soft blob floaters — subtle parallax via --ncx-scroll */}
          <div
            className="absolute -left-24 top-24 w-[420px] h-[420px] opacity-[0.18]"
            style={{
              background: 'radial-gradient(circle, #7B3FE4 0%, transparent 65%)',
              filter: 'blur(80px)',
              animation: 'ncxBlobFloat 22s ease-in-out infinite',
              transform: 'translateY(calc(var(--ncx-scroll, 0) * 0.12px))',
            }}
          />
          <div
            className="absolute -right-24 bottom-12 w-[520px] h-[520px] opacity-[0.16]"
            style={{
              background: 'radial-gradient(circle, #A97CFA 0%, transparent 65%)',
              filter: 'blur(96px)',
              animation: 'ncxBlobFloat 28s ease-in-out infinite reverse',
              transform: 'translateY(calc(var(--ncx-scroll, 0) * -0.08px))',
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[380px] h-[380px] opacity-[0.10]"
            style={{
              background: 'radial-gradient(circle, #C9A9FF 0%, transparent 60%)',
              filter: 'blur(100px)',
              animation: 'ncxBlobFloat 32s ease-in-out infinite',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto py-14 md:py-20">
          {/* Brand lockup */}
          <div
            className="hidden md:inline-flex items-center gap-3 px-3.5 py-1.5 mb-10 rounded-full border ncx-num text-[10px] uppercase tracking-[0.18em]"
            style={{
              animation: a(0.05),
              opacity: o(),
              background: 'var(--ncx-wash)',
              borderColor: 'color-mix(in srgb, var(--ncx-purple-500) 25%, transparent)',
              color: 'var(--ncx-purple-300)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-ncx-gain" style={{ animation: 'ncx-pulse-dot 2s ease-in-out infinite' }} />
            Now Live · QF Network
          </div>

          {/* Headline */}
          <h1
            className="mb-7 font-bold tracking-tight leading-[0.92]"
            style={{ fontSize: 'clamp(3rem, 9vw, 6.5rem)' }}
          >
            <span className="block text-ncx-text" style={{ animation: a(0.18, 'slideLeft'), opacity: o() }}>
              A liquidity layer
            </span>
            <span className="block" style={{ animation: a(0.32, 'slideRight'), opacity: o() }}>
              that feels <span className="ncx-shimmer">soft</span>.
            </span>
          </h1>

          {/* Sub-heading */}
          <p
            className="text-lg md:text-xl text-ncx-text-muted max-w-xl mx-auto leading-relaxed mb-10"
            style={{ animation: a(0.5), opacity: o() }}
          >
            The primary DEX on QF Network. Trade, provide liquidity, and earn yield.
          </p>

          {/* CTA row */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4"
            style={{ animation: a(0.66), opacity: o() }}
          >
            <Link to="/swap" className="btn-ncx btn-ncx-primary group" style={{ padding: '0.9rem 1.6rem', fontSize: '0.9375rem' }}>
              Launch app
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link to="/pools" className="btn-ncx btn-ncx-secondary" style={{ padding: '0.9rem 1.6rem', fontSize: '0.9375rem' }}>
              Explore pools
            </Link>
          </div>

          {/* Hero meta — non-duplicate values */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 mt-8"
            style={{ animation: a(0.78), opacity: o() }}
          >
            <span className="ncx-chip">Chain · 3426</span>
            <span
              className="ncx-chip"
              style={{ background: 'var(--ncx-gain-bg)', color: 'var(--ncx-gain)', borderColor: 'color-mix(in srgb, var(--ncx-gain) 25%, transparent)' }}
            >
              Sub-second finality
            </span>
            <span
              className="ncx-chip"
              style={{ background: 'var(--ncx-info-bg)', color: 'var(--ncx-info)', borderColor: 'color-mix(in srgb, var(--ncx-info) 25%, transparent)' }}
            >
              Substrate-native
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════════════════ */}
      <div ref={statsRef.ref} className="border-y border-ncx-border max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-ncx-border">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="ncx-reveal-sm"
              style={{ animation: statsRef.visible ? `fadeUp .5s ease ${i * .08}s both` : undefined, opacity: statsRef.visible ? undefined : 0 }}
            >
              <StatItem stat={s} active={statsRef.visible} />
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          PRODUCTS
      ════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="products-heading" className="py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-12 ncx-reveal">
            <p className="ncx-num text-[11px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-3">Products</p>
            <h2 id="products-heading" className="text-4xl lg:text-5xl font-bold tracking-tight text-ncx-text mb-3">
              Everything you need.
            </h2>
            <p className="text-ncx-text-muted max-w-md">One protocol for trading, earning, and governing on QF Network.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRODUCTS.map((p, i) => {
              const tone = accentTone[p.accent]
              return (
                <Link
                  key={p.title}
                  to={p.link}
                  className="group relative overflow-hidden ncx-card p-7 transition-all duration-300 ncx-reveal"
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ncx-purple-500)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = ''
                    e.currentTarget.style.transform = ''
                  }}
                >
                  {/* Soft blob accent */}
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 pointer-events-none opacity-50 transition-all duration-500 group-hover:opacity-80 group-hover:rotate-12"
                    style={{ background: tone.bg, borderRadius: 'var(--ncx-r-blob-a)' }}
                  />

                  <div className="relative flex justify-between items-start mb-6">
                    <span
                      className="ncx-num text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border"
                      style={{ color: tone.color, borderColor: tone.border, background: tone.bg }}
                    >
                      {p.tag}
                    </span>
                    <ArrowRight className="w-4 h-4 text-ncx-text-subtle transition-all duration-200 group-hover:text-ncx-purple-300 group-hover:translate-x-1" />
                  </div>
                  <h3 className="relative text-2xl font-semibold tracking-tight text-ncx-text mb-3">{p.title}</h3>
                  <p className="relative text-ncx-text-muted leading-relaxed text-[0.95rem]">{p.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="how-heading" className="border-y border-ncx-border py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="mb-12 ncx-reveal">
            <p className="ncx-num text-[11px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-3">How it works</p>
            <h2 id="how-heading" className="text-4xl lg:text-5xl font-bold tracking-tight text-ncx-text">
              Three steps to DeFi.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="ncx-card relative overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:border-ncx-purple-500/50 ncx-reveal"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="ncx-num text-[10px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-4">Step {s.n}</div>
                <h3 className="text-xl font-semibold text-ncx-text mb-2 tracking-tight">{s.title}</h3>
                <p className="text-ncx-text-muted leading-relaxed text-[0.95rem]">{s.desc}</p>
                <div
                  className="absolute -bottom-12 -right-12 w-32 h-32 opacity-50"
                  style={{ background: 'var(--ncx-wash)', borderRadius: 'var(--ncx-r-blob-b)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHY NUCLEUSX
      ════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="why-heading" className="py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-12 ncx-reveal">
            <p className="ncx-num text-[11px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-3">Why NucleusX</p>
            <h2 id="why-heading" className="text-4xl lg:text-5xl font-bold tracking-tight text-ncx-text mb-3">
              Built different.
            </h2>
            <p className="text-ncx-text-muted max-w-xl">Engineered from the ground up for QF Network.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="ncx-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ncx-purple-500/50 ncx-reveal-sm"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <h3 className="font-semibold text-ncx-text mb-2 tracking-tight">{f.title}</h3>
                <p className="text-ncx-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════════════ */}
      <section ref={ctaRef.ref} className="border-t border-ncx-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(123,63,228,.18) 0%, transparent 55%)' }}
          />
          <div
            className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #7B3FE4 0%, transparent 65%)', filter: 'blur(80px)', animation: 'ncxBlobFloat 24s ease-in-out infinite' }}
          />
        </div>

        <div
          className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-24 lg:py-32 text-center ncx-reveal"
          style={{ animation: ctaRef.visible ? 'fadeUp .65s ease both' : undefined, opacity: ctaRef.visible ? undefined : 0 }}
        >
          <p className="ncx-num text-[11px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-5">Get started today</p>
          <h2
            className="font-bold tracking-tight text-ncx-text mb-6 mx-auto"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.8rem)', maxWidth: '18ch', lineHeight: 1.02 }}
          >
            Your capital. <span className="ncx-shimmer">Fully deployed.</span>
          </h2>
          <p className="text-ncx-text-muted text-lg max-w-md mx-auto mb-10">
            Join thousands of traders and liquidity providers already earning on NucleusX.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/swap" className="btn-ncx btn-ncx-primary group" style={{ padding: '1rem 1.8rem', fontSize: '0.9375rem' }}>
              Start trading
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link to="/pools" className="btn-ncx btn-ncx-secondary" style={{ padding: '1rem 1.8rem', fontSize: '0.9375rem' }}>
              Provide liquidity
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
