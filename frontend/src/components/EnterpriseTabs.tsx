 import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { Users, Building2, BarChart3, User, Recycle, Mail, Plus, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { RecentLogsTable } from './RecentLogsTable';
import { useAuth } from '../hooks/useAuth';
import { api, getApiErrorMessage } from '../lib/api';
import type { WasteLog, DepartmentImpact, TeamInviteResult, PendingInvite } from '../types';

interface EnterpriseTabsProps {
  recentLogs: WasteLog[];
}

interface OrgStats {
  total_org_points: number;
  total_org_kg_recycled: number;
  department_breakdown: DepartmentImpact[];
}

// Count-up animation hook
const useCountUp = (target: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [target, duration]);
  
  return count;
};

// Department colors
const DEPARTMENT_COLORS: Record<string, string> = {
  'Engineering': '#10b981',
  'Sales': '#059669',
  'HR': '#047857',
  'Marketing': '#065f46',
  'Operations': '#064e3b',
  'Finance': '#022c22',
};

export const EnterpriseTabs = ({ recentLogs }: EnterpriseTabsProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-impact' | 'org-overview' | 'organization'>('my-impact');
  const [orgStats, setOrgStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [animatedOrgPoints, setAnimatedOrgPoints] = useState(0);
  const [animatedOrgKg, setAnimatedOrgKg] = useState(0);

  // Organization management state
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteResult, setInviteResult] = useState<TeamInviteResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);

  const hasOrg = user?.org_id || user?.role === 'admin' || user?.role === 'ceo';
  const orgStatsRef = useRef<OrgStats | null>(null);

  // Listen for real-time org log events from Socket.IO
  useEffect(() => {
    const handleNewOrgLog = (event: CustomEvent) => {
      const data = event.detail;
      // Update org stats with real-time data and trigger count-up animation
      if (orgStatsRef.current) {
        const newPoints = data.total_org_points || orgStatsRef.current.total_org_points;
        const newKg = data.total_org_kg_recycled || orgStatsRef.current.total_org_kg_recycled;
        
        setOrgStats(prev => prev ? {
          ...prev,
          total_org_points: newPoints,
          total_org_kg_recycled: newKg,
        } : null);
        
        // Trigger count-up animation
        setAnimatedOrgPoints(newPoints);
        setAnimatedOrgKg(newKg);
      }
    };

    window.addEventListener('new_org_log', handleNewOrgLog as EventListener);
    return () => window.removeEventListener('new_org_log', handleNewOrgLog as EventListener);
  }, []);

  const fetchOrgStats = useCallback(async () => {
    if (!hasOrg) return;
    setLoading(true);
    try {
      // Fetch org-wide data from analytics endpoint
      const response = await api.get('/analytics/forecast');
      
      // Simulate department breakdown (in a real app, this would come from a dedicated endpoint)
      const mockDepartments: DepartmentImpact[] = [
        { department: 'Engineering', total_kg_recycled: 450, total_points: 1250, log_count: 85 },
        { department: 'Sales', total_kg_recycled: 320, total_points: 890, log_count: 62 },
        { department: 'HR', total_kg_recycled: 180, total_points: 520, log_count: 38 },
        { department: 'Marketing', total_kg_recycled: 240, total_points: 680, log_count: 45 },
        { department: 'Operations', total_kg_recycled: 380, total_points: 1050, log_count: 72 },
        { department: 'Finance', total_kg_recycled: 150, total_points: 420, log_count: 28 },
      ];

      const newOrgStats = {
        total_org_points: response.data.last_30_days_total_kg_co2 * 3 + 2500,
        total_org_kg_recycled: response.data.last_30_days_total_kg_co2 * 2.5,
        department_breakdown: mockDepartments,
      };
      
      orgStatsRef.current = newOrgStats;
      setOrgStats(newOrgStats);
    } catch (error) {
      console.error('Failed to fetch org stats:', error);
    } finally {
      setLoading(false);
    }
  }, [hasOrg]);

  useEffect(() => {
    if (activeTab === 'org-overview' && hasOrg && !orgStats) {
      fetchOrgStats();
    }
    if (activeTab === 'organization' && hasOrg) {
      fetchOrgData();
    }
  }, [activeTab, hasOrg, orgStats, fetchOrgStats]);

  const fetchOrgData = useCallback(async () => {
    if (!hasOrg) return;
    try {
      const [membersRes, invitesRes] = await Promise.all([
        api.get<{ members: { id: string; name: string; email: string; role: string }[] }>('/team/members'),
        api.get<{ invites: PendingInvite[] }>('/team/invites/pending').catch(() => ({ data: { invites: [] } })),
      ]);
      setTeamMembers(membersRes.data.members);
      setPendingInvites(invitesRes.data.invites);
    } catch (error) {
      console.error('Failed to fetch org data:', error);
    }
  }, [hasOrg]);

  const addEmailField = () => setInviteEmails((c) => [...c, '']);
  const removeEmailField = (i: number) => setInviteEmails((c) => c.filter((_, idx) => idx !== i).length > 0 ? c.filter((_, idx) => idx !== i) : ['']);
  const updateEmail = (i: number, v: string) => setInviteEmails((c) => c.map((e, idx) => (idx === i ? v : e)));

  const handleInviteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const filtered = inviteEmails.filter((e) => e.trim());
    if (filtered.length === 0) { setInviteError('Add at least one email.'); return; }
    setIsSubmitting(true);
    setInviteError('');
    setInviteMessage('');
    setInviteResult(null);
    try {
      const res = await api.post<{ message: string; results: TeamInviteResult }>('/team/invite', { emails: filtered });
      setInviteResult(res.data.results);
      setInviteMessage(res.data.message);
      setInviteEmails(['']);
      fetchOrgData();
    } catch (err) {
      setInviteError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvite = async (email: string) => {
    try {
      await api.post('/team/invite/resend', { email });
      setInviteMessage(`Invitation resent to ${email}`);
      fetchOrgData();
    } catch (err) {
      setInviteError(getApiErrorMessage(err));
    }
  };

  const handleCancelInvite = async (email: string) => {
    try {
      await api.post('/team/invite/cancel', { email });
      setInviteMessage(`Invitation cancelled for ${email}`);
      fetchOrgData();
    } catch (err) {
      setInviteError(getApiErrorMessage(err));
    }
  };

  // Count-up animation for org stats
  useEffect(() => {
    if (orgStats) {
      setAnimatedOrgPoints(orgStats.total_org_points);
      setAnimatedOrgKg(orgStats.total_org_kg_recycled);
    }
  }, [orgStats]);

  const animatedPoints = useCountUp(animatedOrgPoints);
  const animatedKg = useCountUp(animatedOrgKg);

  const maxKg = Math.max(...(orgStats?.department_breakdown.map(d => d.total_kg_recycled) || [1]));

  return (
    <div className="space-y-6">
      {/* Tab Headers */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-dark-surface p-1.5">
        <button
          onClick={() => setActiveTab('my-impact')}
          className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-black uppercase tracking-wider transition-all ${
            activeTab === 'my-impact'
              ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text-heading shadow-sm'
              : 'text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text'
          }`}
        >
          <User size={16} />
          My Impact
        </button>
        {hasOrg && (
          <>
            <button
              onClick={() => setActiveTab('org-overview')}
              className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-black uppercase tracking-wider transition-all ${
                activeTab === 'org-overview'
                  ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text-heading shadow-sm'
                  : 'text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text'
              }`}
            >
              <BarChart3 size={16} />
              Org Overview
            </button>
            <button
              onClick={() => setActiveTab('organization')}
              className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-black uppercase tracking-wider transition-all ${
                activeTab === 'organization'
                  ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text-heading shadow-sm'
                  : 'text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text'
              }`}
            >
              <Building2 size={16} />
              Organization
            </button>
          </>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'my-impact' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-dark-text-heading uppercase tracking-tight">
              Recent Transactions
            </h2>
          </div>
          <RecentLogsTable logs={recentLogs} />
        </div>
      )}

      {activeTab === 'org-overview' && hasOrg && (
        <div className="space-y-8">
          {/* CEO View Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <BarChart3 size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-dark-text-heading uppercase tracking-tight">
                CEO View
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-wider">
                Organization-Wide Impact Analytics
              </p>
            </div>
          </div>

          {/* Total Org Impact Counters */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 animate-pulse">
                <div className="h-4 w-32 rounded bg-slate-200 dark:bg-dark-surface mb-4" />
                <div className="h-12 w-48 rounded bg-slate-200 dark:bg-dark-surface" />
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 animate-pulse">
                <div className="h-4 w-32 rounded bg-slate-200 dark:bg-dark-surface mb-4" />
                <div className="h-12 w-48 rounded bg-slate-200 dark:bg-dark-surface" />
              </div>
            </div>
          ) : orgStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Points Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-emerald-500 dark:text-emerald-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted">
                    Total Org Points
                  </p>
                </div>
                <p className="text-4xl font-black text-slate-900 dark:text-dark-text-heading">
                  {Math.round(animatedPoints).toLocaleString()}
                </p>
                <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Across all departments
                </p>
              </div>

              {/* Total KG Recycled Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Recycle size={16} className="text-emerald-500 dark:text-emerald-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted">
                    Total Recycled
                  </p>
                </div>
                <p className="text-4xl font-black text-slate-900 dark:text-dark-text-heading">
                  {Math.round(animatedKg).toLocaleString()} kg
                </p>
                <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Waste processed
                </p>
              </div>
            </div>
          ) : null}

          {/* Horizontal Bar Chart - Top Performing Departments */}
          {orgStats && (
            <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-dark-text-heading uppercase tracking-tight">
                    Top Performing Departments
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase tracking-wider mt-1">
                    Ranked by total kg recycled
                  </p>
                </div>
                <BarChart3 size={24} className="text-slate-300 dark:text-dark-border" />
              </div>

              <div className="space-y-5">
                {orgStats.department_breakdown
                  .sort((a, b) => b.total_kg_recycled - a.total_kg_recycled)
                  .map((dept, index) => {
                    const barWidth = (dept.total_kg_recycled / maxKg) * 100;
                    const color = DEPARTMENT_COLORS[dept.department] || '#475569';
                    
                    return (
                      <div key={dept.department} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted w-4">
                              #{index + 1}
                            </span>
                            <span className="text-sm font-black text-slate-700 dark:text-dark-text-heading uppercase tracking-wider">
                              {dept.department}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-500 dark:text-dark-text-muted">
                              {dept.log_count} logs
                            </span>
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                              {dept.total_kg_recycled.toLocaleString()} kg
                            </span>
                          </div>
                        </div>
                        <div className="ml-7 h-3 w-full rounded-full bg-slate-100 dark:bg-dark-surface overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80"
                            style={{
                              width: `${barWidth}%`,
                              background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'organization' && hasOrg && (
        <div className="space-y-8">
          {/* Organization Info */}
            <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Building2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-dark-text-heading uppercase tracking-tight">
                    Your Organization
                  </h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-dark-text-muted">
                    Manage members and invitations
                  </p>
                </div>
              </div>

            {/* Success/Error Messages */}
            {inviteMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                <CheckCircle size={16} />
                {inviteMessage}
              </div>
            )}
            {inviteError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle size={16} />
                {inviteError}
              </div>
            )}
            {inviteResult && (
              <div className="mb-4 space-y-2">
                {inviteResult.invited.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2">
                    <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs text-emerald-700 dark:text-emerald-400">
                      Sent to: {inviteResult.invited.join(', ')}
                    </span>
                  </div>
                )}
                {inviteResult.already_exists.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-2">
                    <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-xs text-amber-700 dark:text-amber-400">
                      Already exists: {inviteResult.already_exists.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Invite Form */}
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 dark:text-dark-text">Invite team members</label>
                <button
                  type="button"
                  onClick={addEmailField}
                  className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                >
                  <Plus size={14} />
                  Add another
                </button>
              </div>

              {inviteEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-dark-text-muted">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      placeholder="colleague@company.com"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface pl-9 pr-3 text-sm text-slate-900 dark:text-dark-text placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                  {inviteEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailField(index)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-dark-border text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                      aria-label="Remove email field"
                      title="Remove email"
                    >
                      <Plus size={16} className="rotate-45" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <Send size={14} />
                    Send Invitations
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Team Members List */}
          {teamMembers.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-dark-text-heading uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users size={16} className="text-emerald-500" />
                Team Members ({teamMembers.length})
              </h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-dark-text">{member.name}</p>
                        <p className="text-xs text-slate-500 dark:text-dark-text-muted">{member.email}</p>
                      </div>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      member.role === 'admin' 
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-400'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-dark-text-heading uppercase tracking-wider mb-4 flex items-center gap-2">
                <Mail size={16} className="text-amber-500" />
                Pending Invitations ({pendingInvites.length})
              </h3>
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <Mail size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-dark-text">{invite.email}</p>
                        <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                          Expires: {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResendInvite(invite.email)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => handleCancelInvite(invite.email)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'org-overview' && !hasOrg && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-dark-border rounded-2xl py-16">
          <Building2 size={48} className="text-slate-300 dark:text-dark-border mb-4" />
          <p className="text-sm font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest">
            No Organization Assigned
          </p>
          <p className="mt-2 text-xs font-bold text-slate-400 dark:text-dark-text-muted">
            Contact your administrator to join an organization
          </p>
        </div>
      )}
    </div>
  );
};
