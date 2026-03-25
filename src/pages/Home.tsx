import {
  Activity,
  ArrowRight,
  BarChart3,
  Droplets, GitBranch,
  Globe,
  Lock,
  Repeat,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
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

// ─── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 847, suffix: 'M+', prefix: '$', label: 'Total Value Locked',  icon: BarChart3 },
  { value: 124, suffix: 'B+', prefix: '$', label: 'Total Volume',         icon: Activity  },
  { value: 156, suffix: '+',  prefix: '',  label: 'Active Pools',         icon: Droplets  },
  { value: 48,  suffix: 'K+', prefix: '',  label: 'Traders',              icon: Users     },
]

const PRODUCTS = [
  {
    icon: Repeat,    title: 'Swap',
    desc:  'Instant token swaps with minimal slippage. Access the deepest liquidity on QF network.',
    link:  '/swap',  tag: 'Trade', green: false,
  },
  {
    icon: Droplets,  title: 'Liquidity Pools',
    desc:  'Provide liquidity and earn a share of every trade. Multiple fee tiers for any strategy.',
    link:  '/pools', tag: 'Earn',  green: true,
  },
  {
    icon: GitBranch, title: 'Farms',
    desc:  'Stake LP tokens to earn boosted NCL rewards and maximise your capital efficiency.',
    link:  '/farms', tag: 'Yield', green: false,
  },
  {
    icon: Lock,      title: 'Staking',
    desc:  'Lock NCL tokens to earn protocol revenue and participate in on-chain governance.',
    link:  '/staking', tag: 'Govern', green: true,
  },
]

const STEPS = [
  {
    n: '01', title: 'Connect Your Wallet',
    desc: 'Link any QF-compatible Substrate wallet in seconds. No account creation required.',
  },
  {
    n: '02', title: 'Choose Your Strategy',
    desc: 'Swap tokens, provide liquidity, farm yields, or stake — your capital, your rules.',
  },
  {
    n: '03', title: 'Capture Yield',
    desc: 'Earn trading fees, NCL rewards, and protocol revenue. Withdraw anytime, no lockups.',
  },
]

const FEATURES = [
  { icon: Zap,       title: 'Lightning Execution',      desc: "Sub-second finality on QF network's high-performance consensus layer." },
  { icon: Shield,    title: 'Audited & Immutable',       desc: 'Third-party audited contracts with immutable core logic and live risk monitoring.' },
  { icon: TrendingUp,title: 'Concentrated Liquidity',   desc: 'Capital-efficient AMM — LPs earn significantly more fees with less deployed capital.' },
  { icon: Globe,     title: 'QF-Native',                desc: 'Built specifically for QF.' },
  { icon: Star,      title: 'Advanced Analytics',       desc: 'Real-time charts, portfolio tracking, and unified position management in one UI.' },
  { icon: Activity,  title: 'Permissionless Markets',   desc: '24/7 on-chain markets with transparent price discovery across all QF asset pairs.' },
]


// ─── Sub-components ────────────────────────────────────────────────────────────

function StatItem({ stat, active }: { stat: typeof STATS[0]; active: boolean }) {
  const n = useCountUp(stat.value, active)
  // const Icon = stat.icon
  return (
    <div className="flex flex-col items-center text-center py-10 px-6 select-none">
      {/* <Icon className="w-5 h-5 text-[#7B3FE4] mb-4" /> */}
      <span className="text-4xl lg:text-5xl font-bold tracking-tighter text-[#F2F2F2] tabular-nums">
        {stat.prefix}{n}{stat.suffix}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A1A1A1] mt-2">{stat.label}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [ready, setReady] = useState(false)
  const statsRef  = useInView(0.2)
  const prodRef   = useInView(0.1)
  const stepsRef  = useInView(0.1)
  const featRef   = useInView(0.1)
  const ctaRef    = useInView(0.2)

  useEffect(() => {
    const prev = document.title
    document.title = 'NucleusX — The Liquidity Command Center on QF Network'
    const t = setTimeout(() => setReady(true), 60)
    return () => { clearTimeout(t); document.title = prev }
  }, [])

  /** Build an animation shorthand string, or 'none' before mount */
  const a = (delay: number, name = 'fadeUp') =>
    ready ? `${name} 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s both` : 'none'

  /** Opacity before mount */
  const o = (condition = ready): 0 | undefined => condition ? undefined : 0

  return (
    <>
      {/* ─── Keyframes ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes slideLeft {
          from { opacity:0; transform:translateX(-36px); }
          to   { opacity:1; transform:translateX(0);     }
        }
        @keyframes slideRight {
          from { opacity:0; transform:translateX(36px); }
          to   { opacity:1; transform:translateX(0);    }
        }
        @keyframes gradientShift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes ringPulse {
          0%,100% { opacity:.45; transform:scale(1);    }
          50%     { opacity:.15; transform:scale(1.07); }
        }
        @keyframes ringPulse2 {
          0%,100% { opacity:.25; transform:scale(1);    }
          50%     { opacity:.08; transform:scale(1.12); }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
        @keyframes scanDown {
          0%   { transform:scaleY(0); transform-origin:top; opacity:1; }
          80%  { transform:scaleY(1); transform-origin:top; opacity:.6; }
          100% { transform:scaleY(1); transform-origin:top; opacity:0;  }
        }
        .grad-text {
          background: linear-gradient(110deg, #F2F2F2 15%, #7B3FE4 45%, #00D084 75%, #F2F2F2 100%);
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 6s linear infinite;
        }
        .product-card:hover { box-shadow: 0 0 40px rgba(123,63,228,.15); }
      `}</style>

      <div className="bg-[#0A0A0A] text-[#F2F2F2]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* ═══════════════════════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center min-h-[92vh] overflow-hidden px-4 text-center">

          {/* Ambient background */}
          <div className="absolute inset-0" aria-hidden="true">
            {/* PixelBlast — interactive pixel field */}
            <PixelBlast
              variant="circle"
              color="#7B3FE4"
              pixelSize={4}
              patternScale={1.8}
              patternDensity={0.82}
              edgeFade={0.38}
              transparent
              speed={0.28}
              enableRipples
              rippleIntensityScale={1.3}
              rippleThickness={0.08}
              rippleSpeed={0.28}
              className="absolute inset-0"
            />
            {/* Overlays (pointer-events-none so PixelBlast ripples still fire in open areas) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Radial glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px]"
                style={{ background: 'radial-gradient(ellipse at 50% 5%, rgba(123,63,228,.18) 0%, transparent 62%)', filter: 'blur(2px)' }}
              />
              {/* Orbital rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-[#2D0A5B]"
                style={{ animation: 'ringPulse 4s ease-in-out infinite' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full border border-[#2D0A5B]/60"
                style={{ animation: 'ringPulse2 5.5s ease-in-out infinite .8s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[#2D0A5B]/25"
                style={{ animation: 'ringPulse2 7s ease-in-out infinite 1.6s' }} />
            </div>
          </div>

          {/* ── Content ── */}
          <div className="relative z-10 max-w-[58rem] mx-auto">

            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2.5 border border-[#2D0A5B] px-4 py-2 mb-8 text-[11px] font-bold uppercase tracking-[0.28em] text-[#7B3FE4]"
              style={{ animation: a(0.1), opacity: o() }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" style={{ animation: 'blink 2s step-start infinite' }} />
              Live on QF Network
            </div>

            {/* Headline */}
            <h1
              className="mb-6 font-bold tracking-tighter leading-[.93]"
              style={{ fontSize: 'clamp(3.2rem, 9.5vw, 7rem)' }}
            >
              <span
                className="block text-[#F2F2F2]"
                style={{ animation: a(0.2, 'slideLeft'), opacity: o() }}
              >
                The Liquidity
              </span>
              <span
                className="block grad-text"
                style={{ animation: a(0.36, 'slideRight'), opacity: o() }}
              >
                Command Center.
              </span>
            </h1>

            {/* Sub-heading */}
            <p
              className="text-lg md:text-xl text-[#A1A1A1] max-w-[38rem] mx-auto leading-relaxed mb-10"
              style={{ animation: a(0.52), opacity: o() }}
            >
              Swap, earn, and govern with the most advanced DeFi tooling on QF network.
            </p>

            {/* CTA row */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
              style={{ animation: a(0.66), opacity: o() }}
            >
              <Link
                to="/swap"
                className="group flex items-center gap-2 px-8 py-4 bg-[#7B3FE4] text-[#F2F2F2] text-sm font-bold uppercase tracking-widest hover:bg-[#6a35cc] transition-colors duration-150"
              >
                Launch App
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/pools"
                className="flex items-center gap-2 px-8 py-4 border border-[#2D0A5B] text-[#A1A1A1] text-sm font-bold uppercase tracking-widest hover:border-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150"
              >
                Explore Pools
              </Link>
            </div>
          </div>

        </section>

        {/* ═══════════════════════════════════════════════════════════════
            STATS BAR
        ════════════════════════════════════════════════════════════════ */}
        <div ref={statsRef.ref} className="border-y border-[#2D0A5B]">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#2D0A5B]">
            {STATS.map((s, i) => (
              <div key={s.label}
                style={{ animation: statsRef.visible ? `fadeUp .5s ease ${i * .08}s both` : 'none', opacity: statsRef.visible ? undefined : 0 }}
              >
                <StatItem stat={s} active={statsRef.visible} />
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            PRODUCTS
        ════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="products-heading" ref={prodRef.ref} className="py-24 lg:py-36 px-4 sm:px-8">
          <div className="max-w-[90rem] mx-auto">

            <div style={{ animation: prodRef.visible ? 'fadeUp .5s ease both' : 'none', opacity: prodRef.visible ? undefined : 0 }}
              className="mb-14"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7B3FE4] mb-3">Products</p>
              <h2 id="products-heading" className="text-4xl lg:text-5xl font-bold tracking-tighter text-[#F2F2F2] mb-2">
                Everything you need.
              </h2>
              <p className="text-[#A1A1A1] max-w-md">One protocol for trading, earning, and governing on QF network.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRODUCTS.map((p, i) => {
                const Icon = p.icon
                const accent = p.green ? '#00D084' : '#7B3FE4'
                return (
                  <Link key={p.title} to={p.link}
                    className="product-card group block border-2 border-[#2D0A5B] p-8 hover:bg-[#2D0A5B] transition-all duration-200"
                    style={{ animation: prodRef.visible ? `fadeUp .5s ease ${.08 + i * .08}s both` : 'none', opacity: prodRef.visible ? undefined : 0 }}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" style={{ color: accent }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5"
                          style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 25%, transparent)` }}
                        >
                          {p.tag}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#A1A1A1] transition-all duration-150 group-hover:text-[#F2F2F2] group-hover:translate-x-1" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-[#F2F2F2] mb-3">{p.title}</h3>
                    <p className="text-[#A1A1A1] leading-relaxed text-[.95rem] group-hover:text-[#F2F2F2]/70 transition-colors duration-200">
                      {p.desc}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="how-heading" ref={stepsRef.ref} className="border-y border-[#2D0A5B] py-24 lg:py-36">
          <div className="max-w-[90rem] mx-auto px-4 sm:px-8">

            <div
              className="mb-14"
              style={{ animation: stepsRef.visible ? 'fadeUp .5s ease both' : 'none', opacity: stepsRef.visible ? undefined : 0 }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7B3FE4] mb-3">How It Works</p>
              <h2 id="how-heading" className="text-4xl lg:text-5xl font-bold tracking-tighter text-[#F2F2F2]">
                Three steps to DeFi.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.n}
                  className="relative border border-[#2D0A5B]/60 p-10 group hover:bg-[#2D0A5B] transition-colors duration-200"
                  style={{ animation: stepsRef.visible ? `fadeUp .5s ease ${.08 + i * .12}s both` : 'none', opacity: stepsRef.visible ? undefined : 0 }}
                >
                  {/* Large background numeral */}
                  <div
                    className="text-[6rem] font-bold leading-none tracking-tighter mb-6 select-none"
                    style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(45,10,91,.9)' }}
                  >
                    {s.n}
                  </div>
                  <h3 className="text-xl font-bold text-[#F2F2F2] mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-[#A1A1A1] leading-relaxed group-hover:text-[#F2F2F2]/70 transition-colors duration-200">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            WHY NUCLEUSX
        ════════════════════════════════════════════════════════════════ */}
        <section aria-labelledby="why-heading" ref={featRef.ref} className="py-24 lg:py-36 px-4 sm:px-8">
          <div className="max-w-[90rem] mx-auto">

            <div
              className="mb-14"
              style={{ animation: featRef.visible ? 'fadeUp .5s ease both' : 'none', opacity: featRef.visible ? undefined : 0 }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7B3FE4] mb-3">Why NucleusX</p>
              <h2 id="why-heading" className="text-4xl lg:text-5xl font-bold tracking-tighter text-[#F2F2F2] mb-2">
                Built different.
              </h2>
              <p className="text-[#A1A1A1] max-w-xl">
                Engineered from the ground up for QF.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2D0A5B]/30">
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={f.title}
                    className="bg-[#0A0A0A] p-8 group hover:bg-[#2D0A5B] transition-colors duration-200"
                    style={{ animation: featRef.visible ? `fadeUp .45s ease ${.04 + i * .06}s both` : 'none', opacity: featRef.visible ? undefined : 0 }}
                  >
                    <Icon className="w-5 h-5 text-[#7B3FE4] mb-5 group-hover:text-[#F2F2F2] transition-colors duration-150" />
                    <h3 className="font-bold text-[#F2F2F2] mb-2 tracking-tight">{f.title}</h3>
                    <p className="text-[#A1A1A1] text-sm leading-relaxed group-hover:text-[#F2F2F2]/70 transition-colors duration-200">
                      {f.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FINAL CTA
        ════════════════════════════════════════════════════════════════ */}
        <section ref={ctaRef.ref} className="border-t border-[#2D0A5B] relative overflow-hidden">
          {/* Glow from below */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(123,63,228,.13) 0%, transparent 55%)' }}
            />
          </div>

          <div
            className="relative max-w-[90rem] mx-auto px-4 sm:px-8 py-28 lg:py-44 text-center"
            style={{ animation: ctaRef.visible ? 'fadeUp .65s ease both' : 'none', opacity: ctaRef.visible ? undefined : 0 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7B3FE4] mb-6">Get Started Today</p>

            <h2
              className="font-bold tracking-tighter text-[#F2F2F2] mb-6 mx-auto"
              style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5.5rem)', maxWidth: '18ch', lineHeight: 1.02 }}
            >
              Your capital.{' '}
              <span className="grad-text">Fully deployed.</span>
            </h2>

            <p className="text-[#A1A1A1] text-lg max-w-md mx-auto mb-12">
              Join thousands of traders and liquidity providers already earning on NucleusX.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/swap"
                className="group flex items-center gap-2 px-10 py-5 bg-[#7B3FE4] text-[#F2F2F2] text-sm font-bold uppercase tracking-widest hover:bg-[#6a35cc] transition-colors duration-150"
              >
                Start Trading
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/pools"
                className="flex items-center gap-2 px-10 py-5 border border-[#2D0A5B] text-[#A1A1A1] text-sm font-bold uppercase tracking-widest hover:border-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150"
              >
                Provide Liquidity
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
