import { Plus, Lightbulb, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { RecentLogsTable } from '../components/RecentLogsTable';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { WasteLog } from '../types';

interface DashboardData {
  total_points: number;
  recent_logs: WasteLog[];
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

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

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-dark-text-heading tracking-tight">
            Welcome, <span className="text-brand-primary">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 dark:text-dark-text-muted font-medium mt-1">Metrics and impact overview for your workspace.</p>
        </div>
        <Link to="/log-waste" className="flex items-center gap-2 bg-brand-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/20">
          <Plus size={20} /> Log New Activity
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard eyebrow="Total Yield" title={`${data?.total_points ?? 0}`} description="Points earned from recycling." icon={Zap} trend="+12%" />
        <StatCard eyebrow="Verification" title="Active" description="All logs current and verified." icon={Plus} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text-heading">Recent Transactions</h2>
            <button className="text-sm font-bold text-brand-primary hover:underline">View All</button>
          </div>
          <RecentLogsTable logs={data?.recent_logs ?? []} />
        </div>

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