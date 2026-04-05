import { Trophy, Medal, Award, Hash } from 'lucide-react'
import { useEffect, useState } from 'react'

import { api, getApiErrorMessage } from '../lib/api'
import type { LeaderboardEntry } from '../types'

export const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get<{ leaders: LeaderboardEntry[] }>('/leaderboard')
        setLeaders(response.data.leaders)
      } catch (loadError) {
        setError(getApiErrorMessage(loadError))
      } finally {
        setLoading(false)
      }
    }

    void loadLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card p-12 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 dark:border-primary-800 border-t-primary-500" />
          <p className="text-sm font-medium text-neutral-500 dark:text-dark-text-muted">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-400">Failed to load leaderboard</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const topThree = leaders.filter((l) => l.rank <= 3)
  const restLeaders = leaders.filter((l) => l.rank > 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-deep-500 dark:text-dark-text-heading sm:text-3xl">
          Community Leaderboard
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-dark-text-muted">
          Top recyclers ranked by total points earned from logged waste
        </p>
      </div>

      {leaders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-dark-border bg-white dark:bg-dark-card py-16 px-6 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-dark-surface text-neutral-400 dark:text-dark-text-muted">
            <Trophy size={40} />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-dark-text">No leaderboard data yet</p>
          <p className="text-xs text-neutral-400 dark:text-dark-text-muted">Add users and logs to see rankings appear here</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {topThree.map((leader) => (
                <article
                  key={leader.id}
                  className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md ${
                    leader.rank === 1
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                      : leader.rank === 2
                      ? 'bg-neutral-50 dark:bg-dark-surface border-neutral-200 dark:border-dark-border'
                      : 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex items-center justify-center">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full shadow-sm ${
                      leader.rank === 1
                        ? 'bg-primary-500 text-white'
                        : leader.rank === 2
                        ? 'bg-neutral-400 text-white'
                        : 'bg-primary-400 text-white'
                    }`}>
                      {leader.rank === 1 ? <Trophy size={28} /> : leader.rank === 2 ? <Medal size={28} /> : <Award size={28} />}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-bold text-deep-500 dark:text-dark-text-heading truncate">{leader.name}</h3>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-dark-text-muted truncate">{leader.email}</p>
                  </div>

                  {/* Points */}
                  <div className="mt-4 rounded-xl bg-white/80 dark:bg-dark-card/80 px-4 py-3 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-dark-text-muted">Total Points</p>
                    <p className="mt-1 text-2xl font-bold text-primary-500">{leader.total_points}</p>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* Rest of Leaderboard */}
          {restLeaders.length > 0 && (
            <section className="rounded-2xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="hidden border-b border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface px-6 py-3 sm:grid sm:grid-cols-12">
                <div className="col-span-1 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-dark-text-muted">Rank</div>
                <div className="col-span-5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-dark-text-muted">User</div>
                <div className="col-span-6 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-dark-text-muted">Points</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-neutral-100 dark:divide-dark-border">
                {restLeaders.map((leader) => (
                  <article
                    key={leader.id}
                    className="group grid grid-cols-12 items-center px-6 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-dark-surface sm:grid"
                  >
                    <div className="col-span-1">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-dark-surface text-sm font-bold text-neutral-600 dark:text-dark-text group-hover:bg-neutral-200 dark:group-hover:bg-dark-bg">
                        <Hash size={14} />
                      </span>
                      <span className="ml-1 text-sm font-bold text-neutral-600 dark:text-dark-text">{leader.rank}</span>
                    </div>
                    <div className="col-span-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                          {leader.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-deep-500 dark:text-dark-text-heading truncate">{leader.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-dark-text-muted truncate">{leader.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-6 text-right">
                      <span className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-900/20 px-3 py-1 text-sm font-bold text-primary-500">
                        {leader.total_points} pts
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}