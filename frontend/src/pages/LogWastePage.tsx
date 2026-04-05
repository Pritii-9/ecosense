import { Leaf, Minus, Plus, CheckCircle2, AlertTriangle, Recycle } from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

import { RecentLogsTable } from '../components/RecentLogsTable'
import { todayString, wasteOptions, wastePointMap } from '../constants'
import type { WasteOption } from '../constants'
import { useAuth } from '../hooks/useAuth'
import { api, getApiErrorMessage } from '../lib/api'
import type { WasteLog } from '../types'

export const LogWastePage = () => {
  const { syncUserPoints } = useAuth()
  const [form, setForm] = useState<{ type: WasteOption; quantity: number; date: string }>({
    type: wasteOptions[0],
    quantity: 1,
    date: todayString(),
  })
  const [logs, setLogs] = useState<WasteLog[]>([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadLogs = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get<{ logs: WasteLog[] }>('/waste')
      setLogs(response.data.logs)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLogs()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await api.post<{ message: string; total_points: number; log: WasteLog }>(
        '/waste',
        form,
      )
      syncUserPoints(response.data.total_points)
      setForm((current) => ({ ...current, quantity: 1, date: todayString() }))
      setSuccessMessage(`${response.data.log.type} log added successfully.`)
      await loadLogs()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      {/* Form Section */}
      <section className="rounded-2xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-500">
            <Leaf size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-dark-text-muted">
              Waste logger
            </span>
            <h2 className="text-xl font-bold text-deep-500 dark:text-dark-text-heading">Log a new waste entry</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-dark-text-muted">
          Each saved entry updates your point total automatically.
        </p>

        {/* Reward Rate Card */}
        <div className="mt-5 rounded-xl bg-primary-50 dark:bg-primary-900/20 p-4 border border-primary-100 dark:border-primary-800">
          <div className="flex items-center gap-2">
            <Recycle size={18} className="text-primary-500" />
            <div>
              <p className="text-sm text-neutral-600 dark:text-dark-text">
                Current reward rate:{' '}
                <span className="font-semibold text-primary-500">{wastePointMap[form.type]} points</span> per unit
              </p>
              <p className="text-xs text-neutral-500 dark:text-dark-text-muted">for <span className="font-medium text-neutral-700 dark:text-dark-text">{form.type}</span></p>
            </div>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Waste Type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-dark-text">Waste type</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {wasteOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, type: option }))}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-all ${
                    form.type === option
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-500 shadow-sm'
                      : 'border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface text-neutral-600 dark:text-dark-text hover:border-neutral-300 dark:hover:border-dark-text-muted hover:bg-neutral-50 dark:hover:bg-dark-bg'
                  }`}
                >
                  <Recycle size={18} className={form.type === option ? 'text-primary-500' : 'text-neutral-400 dark:text-dark-text-muted'} />
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-dark-text">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, quantity: Math.max(1, current.quantity - 1) }))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface text-neutral-600 dark:text-dark-text transition-colors hover:bg-neutral-50 dark:hover:bg-dark-bg"
              >
                <Minus size={16} />
              </button>
              <input
                className="h-10 w-20 rounded-lg border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface px-3 text-center text-sm font-semibold text-deep-500 dark:text-dark-text-heading focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, quantity: Number(event.target.value) }))
                }
                aria-label="Quantity"
                required
              />
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, quantity: current.quantity + 1 }))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface text-neutral-600 dark:text-dark-text transition-colors hover:bg-neutral-50 dark:hover:bg-dark-bg"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-dark-text">Date</label>
            <input
              className="h-10 w-full rounded-lg border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface px-3 text-sm text-deep-500 dark:text-dark-text-heading focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              aria-label="Date"
              required
            />
          </div>

          {/* Success Message */}
          {successMessage ? (
            <div className="flex items-center gap-2 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 px-4 py-3 text-sm text-primary-500">
              <CheckCircle2 size={16} />
              {successMessage}
            </div>
          ) : null}

          {/* Error Message */}
          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <AlertTriangle size={16} />
              {error}
            </div>
          ) : null}

          {/* Submit Button */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving log...
              </>
            ) : (
              <>
                <Plus size={18} strokeWidth={2.5} />
                Save waste log
              </>
            )}
          </button>
        </form>
      </section>

      {/* History Section */}
      <section className="rounded-2xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-deep-500 dark:text-dark-text-heading">Your waste history</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-dark-text-muted">
              Review each entry contributing to your recycling score.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-dark-surface px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-dark-text">
            {logs.length} total logs
          </span>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-neutral-300 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-neutral-200 dark:border-dark-border border-t-neutral-400 dark:border-t-dark-text-muted" />
                <p className="text-sm font-medium text-neutral-500 dark:text-dark-text-muted">Loading your waste history...</p>
              </div>
            </div>
          ) : (
            <RecentLogsTable
              logs={logs}
              emptyMessage="No waste logs yet. Add one from the form to begin tracking."
            />
          )}
        </div>
      </section>
    </div>
  )
}