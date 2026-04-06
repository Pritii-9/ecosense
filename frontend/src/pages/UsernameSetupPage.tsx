import type { FormEvent } from 'react'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

import { AuthPageShell } from '../components/AuthPageShell'
import { useAuth } from '../hooks/useAuth'
import { api, getApiErrorMessage } from '../lib/api'
import type { AuthResponse } from '../types'

export const UsernameSetupPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const checkUsername = useCallback(async (name: string) => {
    if (name.length < 3) {
      setAvailable(null)
      return
    }
    setChecking(true)
    try {
      const response = await api.get<{ available: boolean }>(`/auth/username/check?username=${encodeURIComponent(name)}`)
      setAvailable(response.data.available)
    } catch {
      setAvailable(null)
    } finally {
      setChecking(false)
    }
  }, [])

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(cleaned)
    setAvailable(null)
    setError('')

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (cleaned.length >= 3) {
      const timer = setTimeout(() => {
        checkUsername(cleaned)
      }, 500)
      setDebounceTimer(timer)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (username.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    if (username.length > 20) {
      setError('Username must be at most 20 characters.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.post<AuthResponse>('/auth/username/set', { username })
      setSuccess('Username set successfully!')
      login(response.data.token, response.data.user)
      setTimeout(() => {
        navigate('/dashboard')
      }, 500)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
      setAvailable(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValidLength = username.length >= 3 && username.length <= 20
  const isValidFormat = /^[a-z0-9_]*$/.test(username)

  return (
    <AuthPageShell>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-500/30">
            <User size={28} />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-dark-text-heading">
            Choose your username
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-text-muted">
            Pick a unique username that will be displayed on the leaderboard
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-lg sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-dark-text">Username</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-dark-text-muted">
                  <User size={18} />
                </div>
                <input
                  className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface pl-10 pr-12 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  type="text"
                  placeholder="e.g., eco_warrior_42"
                  value={username}
                  onChange={(event) => handleUsernameChange(event.target.value)}
                  maxLength={20}
                  required
                />
                {/* Availability indicator */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                  {checking && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500" />
                  )}
                  {available === true && !checking && (
                    <CheckCircle size={18} className="text-emerald-500" />
                  )}
                  {available === false && !checking && (
                    <XCircle size={18} className="text-red-500" />
                  )}
                </div>
              </div>

              {/* Validation hints */}
              <div className="mt-2 space-y-1">
                <p className={`text-xs ${isValidLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-dark-text-muted'}`}>
                  {isValidLength ? '✓' : '○'} 3-20 characters
                </p>
                <p className={`text-xs ${isValidFormat ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-dark-text-muted'}`}>
                  {isValidFormat ? '✓' : '○'} Letters, numbers, and underscores only
                </p>
              </div>

              {/* Availability message */}
              {username.length >= 3 && !checking && (
                <p className={`mt-1.5 text-xs font-medium ${available ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {available ? 'Username is available!' : 'Username is taken. Try another.'}
                </p>
              )}

              {error && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  <span className="text-lg">⚠️</span>
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                  <span className="text-lg">✅</span>
                  {success}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              type="submit"
              disabled={isSubmitting || !isValidLength || !isValidFormat}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Setting username...
                </div>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface p-4">
          <p className="text-xs text-slate-500 dark:text-dark-text-muted">
            <strong className="text-slate-700 dark:text-dark-text">Note:</strong> Your username will be visible on the public leaderboard. You can only set it once, so choose wisely!
          </p>
        </div>
      </div>
    </AuthPageShell>
  )
}