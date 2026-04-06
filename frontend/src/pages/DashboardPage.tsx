import { Plus, Lightbulb, ArrowRight, Zap, Building2, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { ForecastCard } from '../components/ForecastCard';
import { EnterpriseTabs } from '../components/EnterpriseTabs';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { api, getApiErrorMessage } from '../lib/api';
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

  // Create org modal
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgCreating, setOrgCreating] = useState(false);
  const [orgError, setOrgError] = useState('');
  const [orgSuccess, setOrgSuccess] = useState('');
  const [leavingOrg, setLeavingOrg] = useState(false);

  const handleLeaveOrg = async () => {
    if (!confirm('Are you sure you want to leave your organization?')) return;
    setLeavingOrg(true);
    try {
      await api.post('/team/org/leave');
      window.location.reload();
    } catch (err) {
      alert(getApiErrorMessage(err) || 'Failed to leave organization.');
    } finally {
      setLeavingOrg(false);
    }
  };

  const handleCreateOrg = async (e: FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) { setOrgError('Organization name is required.'); return; }
    if (user?.org_id) {
      setOrgError('You are already part of an organization. Leave your current org first to create a new one.');
      return;
    }
    setOrgCreating(true);
    setOrgError('');
    setOrgSuccess('');
    try {
      const res = await api.post<{ message: string; org_id: string }>('/team/org', { name: orgName.trim() });
      setOrgSuccess(res.data.message);
      setOrgName('');
      window.location.reload();
    } catch (err) {
      setOrgError(getApiErrorMessage(err));
    } finally {
      setOrgCreating(false);
    }
  };

  // Socket for real-time org sync
  useSocket({
    onNewOrgLog: useCallback((data: unknown) => {
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
            Welcome, <span className="text-emerald-600 dark:text-emerald-400">{user?.username || user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 dark:text-dark-text-muted font-medium mt-1">Metrics and impact overview for your workspace.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!user?.org_id ? (
            <button
              onClick={() => setShowCreateOrg(true)}
              className="flex items-center gap-2 bg-white dark:bg-dark-card border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all shadow-lg"
            >
              <Building2 size={20} /> Create Organization
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-5 py-3 rounded-xl font-semibold">
                <Building2 size={20} />
                <span>Organization: Joined</span>
              </div>
              <button
                onClick={handleLeaveOrg}
                disabled={leavingOrg}
                className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-all disabled:opacity-50"
                title="Leave Organization"
              >
                <LogOut size={16} />
                <span>{leavingOrg ? 'Leaving...' : 'Leave'}</span>
              </button>
            </div>
          )}
          <Link to="/log-waste" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 ring-2 ring-emerald-400/20">
            <Plus size={24} /> Log New Activity
          </Link>
        </div>
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
            <div className="bg-emerald-700 dark:bg-dark-card rounded-3xl p-8 text-white dark:text-dark-text relative overflow-hidden border border-emerald-600 dark:border-dark-border">
               <div className="relative z-10">
                 <Lightbulb className="text-emerald-200 dark:text-emerald-400 mb-4" size={32} />
                 <h3 className="text-xl font-bold">Optimization Tip</h3>
                 <p className="text-emerald-100/70 dark:text-dark-text-muted text-sm mt-3 leading-relaxed">
                   Sorting your paper waste into "White" and "Mixed" categories increases your point yield by 15%.
                 </p>
                 <Link to="/map" className="flex items-center gap-2 mt-6 font-bold text-sm text-emerald-200 dark:text-emerald-400 group">
                   Explore Map <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
               </div>
               <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>
         </div>
       </div>

      {/* Create Org Modal */}
      {showCreateOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-card p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Building2 size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text-heading">Create Organization</h2>
            </div>

            {orgError && (
              <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {orgError}
              </div>
            )}
            {orgSuccess && (
              <div className="mb-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                {orgSuccess}
              </div>
            )}

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-4 text-sm text-slate-900 dark:text-dark-text placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateOrg(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-3 text-sm font-medium text-slate-700 dark:text-dark-text hover:bg-slate-50 dark:hover:bg-dark-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orgCreating}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {orgCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};