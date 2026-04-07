import { Leaf, Globe2, Users, TrendingUp, Recycle, Droplets, Wind } from 'lucide-react';
import EcoSenseLogo from '/ecosense.svg';

export const AuthHero = () => {
  const floatingIcons = [
    { Icon: Leaf, className: 'top-[15%] left-[10%] text-emerald-400/20', size: 32, delay: '0s' },
    { Icon: Droplets, className: 'top-[35%] right-[15%] text-cyan-400/15', size: 24, delay: '1s' },
    { Icon: Wind, className: 'bottom-[25%] left-[20%] text-teal-400/15', size: 28, delay: '2s' },
    { Icon: Recycle, className: 'top-[60%] right-[10%] text-green-400/20', size: 36, delay: '0.5s' },
    { Icon: Globe2, className: 'bottom-[15%] left-[45%] text-emerald-300/10', size: 40, delay: '1.5s' },
  ];

  return (
    <section className="relative hidden w-full items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-emerald-950 to-gray-950 p-12 lg:flex">
      {/* Animated Grid Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} 
        />
      </div>

      {/* Floating Background Icons */}
      {floatingIcons.map(({ Icon, className, size, delay }, i) => (
        <div
          key={i}
          className={`absolute animate-float ${className}`}
          style={{ animationDelay: delay, animationDuration: '6s' }}
        >
          <Icon size={size} />
        </div>
      ))}

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-emerald-600/10 blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-teal-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-1/3 h-48 w-48 rounded-full bg-green-500/5 blur-[80px] animate-pulse" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
        {/* Animated Logo */}
        <div className="relative mb-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-2xl shadow-emerald-500/30 overflow-hidden">
            <img src={EcoSenseLogo} alt="EcoSense" className="h-12 w-12" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 blur-xl animate-pulse" />
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight text-white">
          Track Your
          <span className="block bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
            Environmental Impact
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="mt-6 text-lg leading-relaxed text-gray-400 max-w-md">
          Join thousands making a difference. Log waste, earn points, and build a sustainable future with real-time impact tracking.
        </p>

        {/* Stats Row */}
        <div className="mt-12 grid grid-cols-3 gap-8 w-full max-w-md">
          {[
            { icon: TrendingUp, value: '2.5M+', label: 'Kg Waste Recycled' },
            { icon: Users, value: '50K+', label: 'Active Users' },
            { icon: Globe2, value: '120+', label: 'Countries' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-3 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30">
                <stat.icon size={18} className="text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-white">{stat.value}</span>
              <span className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom Accent */}
        <div className="mt-14 flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/50" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Platform Active</span>
          </div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/50" />
        </div>
      </div>
    </section>
  );
};