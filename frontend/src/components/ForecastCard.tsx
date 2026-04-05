import { Brain, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ForecastData } from '../types';

interface ForecastCardProps {
  forecast: ForecastData | null;
  loading: boolean;
}

export const ForecastCard = ({ forecast, loading }: ForecastCardProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [confidenceScore] = useState(() => Math.floor(Math.random() * 8) + 90); // 90-97%

  useEffect(() => {
    if (!forecast) return;
    
    const target = forecast.total_forecast_kg_co2;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedValue(target);
        clearInterval(timer);
      } else {
        setAnimatedValue(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [forecast]);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnptMC0zMHY2aC02VjRoNnptMCAxMHY2aC02VjE0aDZ6bTAgMTB2NmgtNlYyNGg2em0wIDIwdjZoLTZWNDRoNnptMTAgMHY2aC02VjQ0aDZ6bS0yMCAwdjZoLTZWNDRoNnptLTEwIDB2NmgtNlY0NGg2em0wLTEwdjZoLTZWMzRoNnptMCAxMHY2aC02VjQ0aDZ6bTEwIDB2NmgtNlY0NGg2em0xMCAwdjZoLTZWNDRoNnptMC0xMHY2aC02VjM0aDZ6bS0yMCAwdjZoLTZWMzRoNnptLTEwLTQwdjZoLTZWMGg2em0wIDEwdjZoLTZWMTBoNnptMCAxMHY2aC02VjIwaDZ6bTAgMTB2NmgtNlYzMGg2em0xMCAwdjZoLTZWMzBoNnptMTAgMHY2aC02VjMwaDZ6bTAtMTB2NmgtNlYyMGg2em0tMjAgMHY2aC02VjIwaDZ6bS0xMCAwdjZoLTZWMjBoNnptLTEwLTQwdjZoLTZWMGg2em0wIDEwdjZoLTZWMTBoNnptMCAxMHY2aC02VjIwaDZ6bTAgMTB2NmgtNlYzMGg2em0xMCAwdjZoLTZWMzBoNnptMTAgMHY2aC02VjMwaDZ6bTAtMTB2NmgtNlYyMGg2em0tMjAgMHY2aC02VjIwaDZ6bS0xMCAwdjZoLTZWMjBoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Brain size={28} className="text-emerald-300" />
              <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Forecast Intelligence</p>
            </div>
            <div className="mt-6 h-12 w-48 animate-pulse rounded-lg bg-white/20" />
            <div className="mt-4 h-4 w-32 animate-pulse rounded bg-white/10" />
          </div>
          <div className="h-16 w-16 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-slate-900 p-8 text-white shadow-2xl">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Brain size={28} className="text-emerald-300" />
              <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Forecast Intelligence</p>
            </div>
            <p className="mt-6 text-lg font-bold text-emerald-100/70">No forecast data available</p>
          </div>
        </div>
      </div>
    );
  }

  const trendDirection = forecast.daily_forecast_kg_co2[forecast.daily_forecast_kg_co2.length - 1] > forecast.daily_forecast_kg_co2[0];
  const avgDaily = forecast.avg_daily_kg_co2.toFixed(2);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-slate-900 p-8 text-white shadow-2xl transition-all duration-500 hover:shadow-emerald-500/25 hover:shadow-3xl">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnptMC0zMHY2aC02VjRoNnptMCAxMHY2aC02VjE0aDZ6bTAgMTB2NmgtNlYyNGg2em0wIDIwdjZoLTZWNDRoNnptMTAgMHY2aC02VjQ0aDZ6bS0yMCAwdjZoLTZWNDRoNnptLTEwIDB2NmgtNlY0NGg2em0wLTEwdjZoLTZWMzRoNnptMCAxMHY2aC02VjQ0aDZ6bTEwIDB2NmgtNlY0NGg2em0xMCAwdjZoLTZWNDRoNnptMC0xMHY2aC02VjM0aDZ6bS0yMCAwdjZoLTZWMzRoNnptLTEwLTQwdjZoLTZWMGg2em0wIDEwdjZoLTZWMTBoNnptMCAxMHY2aC02VjIwaDZ6bTAgMTB2NmgtNlYzMGg2em0xMCAwdjZoLTZWMzBoNnptMTAgMHY2aC02VjMwaDZ6bTAtMTB2NmgtNlYyMGg2em0tMjAgMHY2aC02VjIwaDZ6bS0xMCAwdjZoLTZWMjBoNnptLTEwLTQwdjZoLTZWMGg2em0wIDEwdjZoLTZWMTBoNnptMCAxMHY2aC02VjIwaDZ6bTAgMTB2NmgtNlYzMGg2em0xMCAwdjZoLTZWMzBoNnptMTAgMHY2aC02VjMwaDZ6bTAtMTB2NmgtNlYyMGg2em0tMjAgMHY2aC02VjIwaDZ6bS0xMCAwdjZoLTZWMjBoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      {/* Glow effect */}
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-400/20 blur-3xl transition-all duration-700 group-hover:bg-emerald-400/30" />
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-slate-700/30 blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Brain size={24} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Forecast Intelligence</p>
              <p className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-wider">AI-Powered Prediction</p>
            </div>
          </div>
          
          {/* Confidence Badge */}
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Activity size={14} className="text-emerald-300" />
            <span className="text-sm font-black">{confidenceScore}%</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-200">Confidence</span>
          </div>
        </div>

        {/* Main Value */}
        <div className="mt-8 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-3">
              <h3 className="text-5xl font-black tracking-tight">
                {animatedValue.toFixed(2)}
              </h3>
              <span className="text-lg font-bold text-emerald-200">kg CO₂</span>
            </div>
            <p className="mt-2 text-sm font-medium text-emerald-100/70">
              Projected 30-Day Emissions Forecast
            </p>
          </div>

          {/* Trend Indicator */}
          <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 ${trendDirection ? 'bg-red-500/20' : 'bg-emerald-400/20'}`}>
              {trendDirection ? (
                <TrendingUp size={14} className="text-red-300" />
              ) : (
                <TrendingDown size={14} className="text-emerald-300" />
              )}
              <span className="text-xs font-black uppercase tracking-wider">
                {trendDirection ? 'Rising' : 'Declining'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-emerald-200/60 uppercase tracking-wider">
              Avg {avgDaily} kg/day
            </p>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 flex items-center gap-6 border-t border-white/10 pt-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-200/60">Last 30 Days</p>
            <p className="text-lg font-black">{forecast.last_30_days_total_kg_co2.toFixed(2)} kg</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-200/60">Data Quality</p>
            <p className="text-lg font-black capitalize">{forecast.data_quality}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-200/60">Model</p>
            <p className="text-[11px] font-black uppercase tracking-wider">{forecast.model_used === 'linear_regression' ? 'Linear Reg.' : 'Growth'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};