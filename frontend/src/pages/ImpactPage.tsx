import { Globe, Wind, Trees, Star, BarChart3, Users, Zap, Recycle, type LucideProps } from 'lucide-react'
import { useEffect, useState, type ForwardRefExoticComponent, type RefAttributes } from 'react'
import { api } from '../lib/api'
import type { ImpactData, ActivityFeedItem, TypeBreakdown } from '../types'
import { useSocket } from '../hooks/useSocket'

// Map waste types to Lucide icons
const WASTE_TYPE_ICONS: Record<string, ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>> = {
  Plastic: Recycle,
  Paper: Recycle,
  Glass: Recycle,
  Organic: Recycle,
  Metal: Recycle,
}

const timeFilterOptions = [
  { value: 'today' as const, label: 'Today' },
  { value: 'this_week' as const, label: 'This Week' },
  { value: 'this_month' as const, label: 'This Month' },
  { value: 'all_time' as const, label: 'All Time' },
]

export const ImpactPage = () => {
  const [impactData, setImpactData] = useState<ImpactData | null>(null)
  const [feed, setFeed] = useState<ActivityFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<typeof timeFilterOptions[number]['value']>('all_time')

  const {
    isConnected,
    impactData: socketImpactData,
    activityFeed: socketFeed,
  } = useSocket({
    onImpactUpdate: (data) => {
      setImpactData(data)
    },
  })

  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        const response = await api.get('/impact')
        setImpactData(response.data)
      } catch (error) {
        console.error('Failed to fetch impact data:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchFeed = async () => {
      try {
        const response = await api.get('/impact/activity-feed')
        setFeed(response.data.feed)
      } catch (error) {
        console.error('Failed to fetch activity feed:', error)
      }
    }

    fetchImpactData()
    fetchFeed()
  }, [])

  const displayImpact = socketImpactData || impactData
  const displayFeed = socketFeed.length > 0 ? socketFeed : feed

  const stats = displayImpact?.[timeFilter] ?? {
    total_quantity: 0,
    total_points: 0,
    total_co2_saved_kg: 0,
    trees_saved_equivalent: 0,
    log_count: 0,
  }

  const typeBreakdown = displayImpact?.type_breakdown as TypeBreakdown | undefined
  const maxQuantity = typeBreakdown
    ? Math.max(...Object.values(typeBreakdown).map((d) => d.quantity), 1)
    : 1

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-500" />
          <p className="text-sm font-medium text-slate-500 dark:text-dark-text-muted">Loading impact data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-dark-text-heading sm:text-3xl">
            Your Environmental Impact
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-dark-text-muted">
            Track your contribution to a sustainable future
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${isConnected ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-dark-surface text-slate-500 dark:text-dark-text-muted'}`}>
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-dark-text-muted'}`} />
            {isConnected ? 'Live' : 'Connecting...'}
          </div>
          {/* Time Filter */}
          <div className="flex rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-1 shadow-sm">
            {timeFilterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTimeFilter(option.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  timeFilter === option.value
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-dark-text-muted hover:bg-slate-100 dark:hover:bg-dark-surface'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ImpactStatCard
          icon={Globe}
          label="Total Waste Recycled"
          value={`${stats.total_quantity} kg`}
          subtitle={`${stats.log_count} logs`}
        />
        <ImpactStatCard
          icon={Wind}
          label="CO₂ Saved"
          value={`${stats.total_co2_saved_kg} kg`}
          subtitle="Estimated emissions reduced"
        />
        <ImpactStatCard
          icon={Trees}
          label="Trees Saved"
          value={stats.trees_saved_equivalent.toFixed(1)}
          subtitle="Equivalent tree absorption"
        />
        <ImpactStatCard
          icon={Star}
          label="Points Earned"
          value={stats.total_points.toString()}
          subtitle="Community recycling points"
        />
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Waste Type Breakdown */}
        <article className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text-heading">Waste Type Breakdown</h2>
              <p className="text-xs text-slate-500 dark:text-dark-text-muted">By material category</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {typeBreakdown && Object.entries(typeBreakdown).length > 0 ? (
              Object.entries(typeBreakdown).map(([type, data]) => {
                const IconComponent = WASTE_TYPE_ICONS[type] ?? Recycle
                return (
                  <div key={type} className="group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent size={16} className="text-emerald-500 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-dark-text-heading">{type}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-dark-text">{data.quantity} kg</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-dark-surface">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
                        style={{ width: `${(data.quantity / maxQuantity) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-dark-text-muted">CO₂ saved: {data.co2_saved_kg} kg</p>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-dark-border bg-slate-50 dark:bg-dark-surface py-10">
                <BarChart3 size={32} className="text-slate-400 dark:text-dark-text-muted" />
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-dark-text-muted">No waste data yet</p>
                <p className="text-xs text-slate-400 dark:text-dark-text-muted">Start logging to see your impact!</p>
              </div>
            )}
          </div>
        </article>

        {/* Community Stats */}
        <article className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text-heading">Community Stats</h2>
              <p className="text-xs text-slate-500 dark:text-dark-text-muted">Collective environmental impact</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <CommunityStatRow label="Active Recyclers (24h)" value={displayImpact?.active_recyclers_24h ?? 0} />
            <CommunityStatRow label="Total Users" value={displayImpact?.total_users ?? 0} />
            <CommunityStatRow label="All-Time Waste Recycled" value={`${displayImpact?.all_time.total_quantity ?? 0} kg`} />
            <CommunityStatRow label="All-Time CO₂ Saved" value={`${displayImpact?.all_time.total_co2_saved_kg ?? 0} kg`} accent="success" />
          </div>
        </article>
      </section>

      {/* Live Activity Feed */}
      <article className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text-heading">Live Activity Feed</h2>
              <p className="text-xs text-slate-500 dark:text-dark-text-muted">Real-time community recycling updates</p>
            </div>
          </div>
        </div>
        <div className="mt-5 max-h-96 space-y-3 overflow-y-auto pr-1">
          {displayFeed.length > 0 ? (
            displayFeed.map((item, index) => {
              const IconComponent = WASTE_TYPE_ICONS[item.type] ?? Recycle
              return (
                <div
                  key={index}
                  className={`group flex items-center gap-4 rounded-xl border px-4 py-3 transition-all duration-200 hover:shadow-md ${
                    index === 0
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm'
                      : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface hover:border-emerald-200 dark:hover:border-emerald-800'
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 group-hover:scale-105">
                    <IconComponent size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 dark:text-dark-text">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.user_name}</span>
                      {' '}recycled{' '}
                      <strong className="font-bold text-slate-900 dark:text-dark-text-heading">{item.quantity} kg</strong>
                      {' '}of {item.type}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-dark-text-muted">+{item.points} recycling points earned</p>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-dark-surface px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-dark-text">
                      {item.time_ago}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-surface text-slate-400 dark:text-dark-text-muted">
                <Recycle size={32} />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-dark-text-muted">No activity yet</p>
              <p className="text-xs text-slate-400 dark:text-dark-text-muted">Be the first to log some waste!</p>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

function ImpactStatCard({ icon: Icon, label, value, subtitle }: { icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; label: string; value: string; subtitle: string }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-dark-text-muted">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
          <Icon size={22} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-text-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-dark-text-heading">{value}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-dark-text-muted">{subtitle}</p>
        </div>
      </div>
    </article>
  )
}

function CommunityStatRow({ label, value, accent }: { label: string; value: string | number; accent?: 'success' }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-dark-surface px-4 py-3 transition-colors hover:bg-slate-100 dark:hover:bg-dark-bg">
      <span className="text-sm text-slate-600 dark:text-dark-text">{label}</span>
      <span className={`text-lg font-bold ${accent === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-dark-text-heading'}`}>{value}</span>
    </div>
  )
}
