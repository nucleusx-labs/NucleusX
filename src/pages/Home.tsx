import { Link } from 'react-router-dom'
import { ArrowRight, Droplets, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[90vh] pb-10">

      {/* Main Bento Grid */}
      <section className="w-full max-w-7xl mx-auto h-[80vh] grid grid-cols-1 lg:grid-cols-3 grid-rows-3 lg:grid-rows-2 gap-6 p-4">

        {/* Left block (large) — hero */}
        <div className="bento-box lg:col-span-2 row-span-2 flex flex-col justify-between p-8 md:p-12 relative group">
          <div className="absolute inset-0 bg-stone-300 opacity-20 mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")' }}></div>
          <div className="noise-overlay opacity-60"></div>

          <div className="relative z-10 mt-10">
            <h1 className="text-6xl sm:text-7xl md:text-[6rem] font-black uppercase leading-[0.85] tracking-tighter text-brutalist-panel-text mix-blend-hard-light">
              Trade<br/>
              <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>Without</span><br/>
              Asking<br/>
              {/* Purple for primary headline accent */}
              <span className="relative inline-block hover-jitter text-brutalist-accent">Permission.</span>
            </h1>
            <p className="mt-8 text-lg font-bold max-w-md border-l-[4px] border-black pl-4 text-black/80">
              Enjoy Permissionless swaps on the QFNetwork.
            </p>
          </div>
        </div>

        {/* Right top: Visual element */}
        <div className="bento-box bg-brutalist-surface text-brutalist-text p-8 flex items-center justify-center relative overflow-hidden group">
          <div className="noise-overlay opacity-30 invert"></div>
          <div className="relative w-48 h-48 animate-[spin_10s_linear_infinite] group-hover:animate-none">
            {/* Purple outer ring, teal inner ring */}
            <div className="absolute inset-0 border-[4px] border-brutalist-accent rotate-12 skew-x-12 bg-black/50 backdrop-blur-sm" />
            <div className="absolute inset-4 border-[4px] border-brutalist-teal -rotate-6 -skew-y-6" />
            {/* Orange glow */}
            <div className="absolute -bottom-10 left-1/2 w-32 h-32 bg-brutalist-orange rounded-full blur-[40px] mix-blend-screen opacity-60" />
            <div className="absolute top-10 -right-10 w-20 h-20 bg-brutalist-teal rounded-full blur-[30px] mix-blend-screen opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className="w-16 h-16 text-brutalist-text opacity-80 mix-blend-difference" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 text-xs font-black uppercase tracking-widest text-brutalist-text-muted">
            [ Nucleus_X ]
          </div>
        </div>

        {/* Right bottom: CTA */}
        <div className="bento-box p-8 flex flex-col justify-center bg-brutalist-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-[10px] bg-black"></div>
          <h2 className="text-3xl font-black uppercase mb-6 leading-tight text-brutalist-panel-text">
            Start<br/>Trading.
          </h2>
          <div className="mt-auto">
            <Link to="/swap" className="btn-brutal w-full flex items-center justify-between group">
              <span>Launch Exchange</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-75 step-end opacity-0 group-hover:opacity-100" />
            </Link>
          </div>
        </div>

      </section>

      {/* Feature Cards */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 mt-8">
        {[
          { title: "Deep Liquidity", desc: "Pools that don't run dry. Slippage you can live with.", icon: Droplets, color: 'teal' },
          { title: "Earn Yield", desc: "Farm tokens. Stack rewards. Compound forever.", icon: TrendingUp, color: 'teal' },
          { title: "Deep Liquidity", desc: "Pools that don't run dry. Slippage you can live with.", icon: Droplets, color: 'teal' },
          { title: "Earn Yield", desc: "Farm tokens. Stack rewards. Compound forever.", icon: TrendingUp, color: 'teal' },
        ].map((item, i) => (
          <div key={i} className="bento-box-dark p-6 flex flex-col hover:-translate-y-2 transition-transform duration-100 ease-in-out">
            <div className={`w-12 h-12 border-[2px] flex items-center justify-center mb-4 bg-black rotate-3 ${item.color === 'teal' ? 'border-brutalist-teal' : item.color === 'orange' ? 'border-brutalist-orange' : 'border-brutalist-accent'}`}>
              <item.icon className={`w-6 h-6 ${item.color === 'teal' ? 'text-brutalist-teal' : item.color === 'orange' ? 'text-brutalist-orange' : 'text-brutalist-accent'}`} />
            </div>
            <h3 className="text-xl font-black uppercase text-brutalist-text mb-2">{item.title}</h3>
            <p className="text-brutalist-text-muted text-sm font-bold">{item.desc}</p>
          </div>
        ))}
      </section>

    </div>
  )
}
