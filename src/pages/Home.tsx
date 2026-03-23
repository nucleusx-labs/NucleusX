import { Link } from 'react-router-dom'
import { ArrowRight, Skull, EyeOff, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[90vh] pb-10">
      
      {/* 
        The Bento Grid - A prison for dreams
        Thick visible grid lines (simulated via gaps and borders), uneven cells 
      */}
      <section className="w-full max-w-7xl mx-auto h-[80vh] grid grid-cols-1 lg:grid-cols-3 grid-rows-3 lg:grid-rows-2 gap-6 p-4">
        
        {/* Left block (large) */}
        <div className="bento-box lg:col-span-2 row-span-2 flex flex-col justify-between p-8 md:p-12 relative group">
          {/* Grainy concrete texture background is handled by our utility, let's add an explicit one here to clash */}
          <div className="absolute inset-0 bg-stone-300 opacity-20 mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")' }}></div>
          <div className="noise-overlay opacity-60"></div>

          <div className="relative z-10 flex justify-between items-start w-full">
            <div className="px-3 py-1 border-[3px] border-black text-black font-black uppercase text-xs tracking-widest bg-[#ff3300] shadow-[4px_4px_0_#000] rotate-[-2deg]">
              Status: Critical
            </div>
            <EyeOff className="w-8 h-8 text-black opacity-50" />
          </div>

          <div className="relative z-10 mt-10">
            {/* Giant aggressive headline */}
            <h1 className="text-6xl sm:text-7xl md:text-[6rem] font-black uppercase leading-[0.85] tracking-tighter text-[#121212] mix-blend-hard-light">
              System<br/>
              <span className="text-transparent border-text" style={{ WebkitTextStroke: '2px black' }}>Failure</span><br/>
              Is A<br/>
              <span className="relative inline-block hover-jitter text-[#ff3300]">Feature</span>
            </h1>
            <p className="mt-8 text-lg font-bold max-w-md border-l-[4px] border-black pl-4 text-black/80">
              We reject polished, corporate UI. We rely on chaos. This is not for everyone.
            </p>
          </div>
        </div>

        {/* Right top: Surreal visual element */}
        <div className="bento-box bg-[#121212] text-[#e8e8e4] p-8 flex items-center justify-center relative overflow-hidden group">
          <div className="noise-overlay opacity-30 invert"></div>
          {/* Floating 3D cube... melting at edges */}
          <div className="relative w-48 h-48 animate-[spin_10s_linear_infinite] group-hover:animate-none">
            {/* Base cube shape */}
            <div className="absolute inset-0 border-[4px] border-[#ff3300] rotate-12 skew-x-12 bg-black/50 backdrop-blur-sm" />
            <div className="absolute inset-4 border-[4px] border-[#8c8c8c] -rotate-6 -skew-y-6" />
            {/* Melting artifact */}
            <div className="absolute -bottom-10 left-1/2 w-32 h-32 bg-[#ff3300] rounded-full blur-[40px] mix-blend-screen mix-blend-color-dodge opacity-80" />
            <div className="absolute top-10 -right-10 w-20 h-20 bg-blue-600 rounded-full blur-[30px] mix-blend-screen opacity-60" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <Skull className="w-16 h-16 text-[#e8e8e4] opacity-80 mix-blend-difference" />
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4 text-xs font-black uppercase tracking-widest text-[#8c8c8c]">
            [ Object_Corruption ]
          </div>
        </div>

        {/* Right bottom: CTA button inside harsh bordered box */}
        <div className="bento-box p-8 flex flex-col justify-center bg-[#d4c0a8] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-[10px] bg-black"></div>
          
          <h2 className="text-3xl font-black uppercase mb-6 leading-tight">
            Do not<br/> Click this.
          </h2>
          
          <div className="mt-auto">
            <Link
              to="/swap"
              className="btn-brutal w-full flex items-center justify-between group"
            >
              <span>Execute</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-75 step-end opacity-0 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
        
      </section>

      {/* Secondary Grid to showcase more contradiction */}
      <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 mt-8">
        {[
          { title: "Hostile", desc: "Friction is the point.", icon: Zap },
          { title: "Honest", desc: "No rounded lies.", icon: EyeOff },
          { title: "Visceral", desc: "Feel every click.", icon: Skull },
          { title: "Alive", desc: "But barely.", icon: ArrowRight },
        ].map((item, i) => (
          <div key={i} className="bento-box-dark p-6 flex flex-col hover:-translate-y-2 transition-transform duration-100 ease-in-out">
            <div className="w-12 h-12 border-[2px] border-[#ff3300] flex items-center justify-center mb-4 bg-black rotate-3">
              <item.icon className="w-6 h-6 text-[#ff3300]" />
            </div>
            <h3 className="text-xl font-black uppercase text-white mb-2">{item.title}</h3>
            <p className="text-[#8c8c8c] text-sm font-bold">{item.desc}</p>
          </div>
        ))}
      </section>
      
    </div>
  )
}