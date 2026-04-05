import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Mail, ArrowRight } from 'lucide-react'

import { AuthPageShell } from '../components/AuthPageShell'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../hooks/useAuth'
import { api, getApiErrorMessage } from '../lib/api'
import type { AuthResponse } from '../types'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = {
      email: email ? '' : 'Email is required.',
      password: password ? '' : 'Password is required.',
    }

    setErrors(nextErrors)
    setError('')

    if (nextErrors.email || nextErrors.password) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password })
      login(response.data.token, response.data.user)
      navigate('/dashboard')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-500/30">
            <Leaf size={28} fill="currentColor" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-dark-text-heading">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-text-muted">
            Sign in to your EcoSense account to continue tracking your sustainability impact
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-lg sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-dark-text">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-dark-text-muted">
                  <Mail size={18} />
                </div>
                <input
                  className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface pl-10 pr-4 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => setErrors((current) => ({ ...current, email: email ? '' : 'Email is required.' }))}
                  required
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <PasswordField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() =>
                  setErrors((current) => ({
                    ...current,
                    password: password ? '' : 'Password is required.',
                  }))
                }
                error={errors.password ?? ''}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="text-sm text-slate-600 dark:text-dark-text-muted">Remember me</span>
              </label>
              <Link className="text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:text-emerald-700 dark:hover:text-emerald-300" to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </div>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 space-y-3 text-center">
          <p className="text-sm text-slate-500 dark:text-dark-text-muted">
            Don't have an account?{' '}
            <Link className="font-semibold text-emerald-600 dark:text-emerald-400 transition-colors hover:text-emerald-700 dark:hover:text-emerald-300" to="/register">
              Create one now
            </Link>
          </p>
          <p className="text-sm text-slate-500 dark:text-dark-text-muted">
            Have an invitation code?{' '}
            <Link className="font-semibold text-emerald-600 dark:text-emerald-400 transition-colors hover:text-emerald-700 dark:hover:text-emerald-300" to="/team-invite">
              Join your team here
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  )
}