import { Plus, Lightbulb, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { ForecastCard } from '../components/ForecastCard';
import { EnterpriseTabs } from '../components/EnterpriseTabs';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import type { WasteLog, ForecastData } from '../types';

interface DashboardData {
  total_points: number;
  recent_logs: WasteLog[];
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Socket for real-time org sync
  useSocket({
    onNewOrgLog: useCallback((data) => {
      // Dispatch custom event for EnterpriseTabs to listen to
      window.dispatchEvent(new CustomEvent('new_org_log', { detail: data }));
    }, []),
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchForecast = async () => {
      setForecastLoading(true);
      try {
        const response = await api.get('/analytics/forecast');
        setForecast(response.data);
      } catch (error) {
        console.error('Failed to fetch forecast data:', error);
      } finally {
        setForecastLoading(false);
      }
    };
    fetchForecast();
  }, []);

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-dark-text-heading tracking-tight">
            Welcome, <span className="text-brand-primary">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 dark:text-dark-text-muted font-medium mt-1">Metrics and impact overview for your workspace.</p>
        </div>
        <Link to="/log-waste" className="flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/20">
          <Plus size={20} /> Log New Activity
        </Link>
      </div>

      {/* Forecast Intelligence Card */}
      <ForecastCard forecast={forecast} loading={forecastLoading} />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard eyebrow="Total Yield" title={`${data?.total_points ?? 0}`} description="Points earned from recycling." icon={Zap} trend="+12%" />
        <StatCard eyebrow="Verification" title="Active" description="All logs current and verified." icon={Plus} />
      </div>

      {/* Enterprise Intelligence Tabs */}
      <EnterpriseTabs recentLogs={data?.recent_logs ?? []} />

      {/* Side Card - Optimization Tip */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2" />
        <div className="space-y-6">
           <div className="bg-brand-dark dark:bg-dark-card rounded-3xl p-8 text-white dark:text-dark-text relative overflow-hidden border border-dark-border">
              <div className="relative z-10">
                <Lightbulb className="text-brand-primary mb-4" size={32} />
                <h3 className="text-xl font-bold">Optimization Tip</h3>
                <p className="text-emerald-100/70 dark:text-dark-text-muted text-sm mt-3 leading-relaxed">
                  Sorting your paper waste into "White" and "Mixed" categories increases your point yield by 15%.
                </p>
                <Link to="/map" className="flex items-center gap-2 mt-6 font-bold text-sm text-brand-primary group">
                  Explore Map <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl" />
           </div>
        </div>
      </div>
    </div>
  );
};