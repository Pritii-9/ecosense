import { ShieldCheck, Zap, MapPin } from 'lucide-react';

export const AuthHero = () => {
  return (
    <section className="relative hidden w-full items-center justify-center overflow-hidden bg-[#004040] p-12 lg:flex">
      {/* Precision Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: 'radial-gradient(#CFCFCF 0.5px, transparent 0.5px)', 
          backgroundSize: '32px 32px' 
        }} 
      />
      
      {/* Structural Accents */}
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#00563f]/20 blur-[120px]" />
      <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-[#CFCFCF]/10 blur-[100px]" />

      <div className="relative z-10 flex max-w-lg flex-col items-start">
        {/* Professional Logo Icon */}
        <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-lg border border-[#CFCFCF]/30 bg-white/5 backdrop-blur-md">
          <Zap className="text-[#00563f]" size={28} fill="currentColor" />
        </div>

        <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-white">
          Precision Metrics for <br />
          <span className="text-[#CFCFCF]">Sustainability.</span>
        </h1>
        
        <p className="mt-6 text-lg leading-relaxed text-neutral-300 font-medium">
          A professional-grade framework for monitoring environmental impact. Log waste, analyze real-time metrics, and contribute to a verified circular economy.
        </p>

        {/* Feature Grid - Sharp & Minimalist */}
        <div className="mt-12 grid w-full gap-6">
          {[
            { icon: ShieldCheck, title: "Verified Logging", desc: "End-to-end encrypted waste verification." },
            { icon: Zap, title: "Live Sync", desc: "Instant point updates via Socket.IO protocols." },
            { icon: MapPin, title: "Certified Terminals", desc: "Access to a global network of recycling centers." }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-5 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-[#CFCFCF]/20 bg-white/5 transition-all duration-300 group-hover:bg-[#00563f] group-hover:border-[#00563f]">
                <feature.icon size={20} className="text-white" />
              </div>
              <div className="border-l border-[#CFCFCF]/20 pl-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  {feature.title}
                </p>
                <p className="mt-1 text-xs text-neutral-400 font-medium">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Footer Stat */}
        <div className="mt-16 border-t border-[#CFCFCF]/10 pt-8 w-full">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CFCFCF]/60">
            Current Network Status: <span className="text-[#00563f]">Active / Verified</span>
          </p>
        </div>
      </div>
    </section>
  );
};