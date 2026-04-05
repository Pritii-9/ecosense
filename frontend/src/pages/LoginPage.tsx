import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20">
            <span className="text-xl">🌿</span>
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900 dark:text-dark-text-heading">Welcome back</h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-dark-text-muted">
            Sign in to your EcoSense account to continue
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-dark-text">Email address</label>
            <input
              className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 text-sm text-neutral-900 dark:text-dark-text shadow-sm transition-colors placeholder:text-neutral-400 dark:placeholder:text-dark-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setErrors((current) => ({ ...current, email: email ? '' : 'Email is required.' }))}
              required
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          {/* Password */}
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

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 flex flex-col items-center gap-4 text-center">
          <Link className="text-sm font-medium text-primary-600 dark:text-primary-400 transition-colors hover:text-primary-700 dark:hover:text-primary-300" to="/forgot-password">
            Forgot your password?
          </Link>
          <p className="text-sm text-neutral-500 dark:text-dark-text-muted">
            Don't have an account?{' '}
            <Link className="font-semibold text-primary-600 dark:text-primary-400 transition-colors hover:text-primary-700 dark:hover:text-primary-300" to="/register">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  )
}