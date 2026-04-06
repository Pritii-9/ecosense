import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, ArrowRight, Mail, User, KeyRound } from 'lucide-react'

import { AuthPageShell } from '../components/AuthPageShell'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../hooks/useAuth'
import { api, getApiErrorMessage } from '../lib/api'
import { validateEmail, validateFirstName, validatePassword, validatePasswordConfirmation, validateVerificationCode } from '../lib/validation'
import type { AuthResponse } from '../types'

export const TeamLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = {
      email: validateEmail(email),
      code: validateVerificationCode(code),
      name: validateFirstName(name),
      username: username.length >= 3 && username.length <= 20 ? '' : 'Username must be 3-20 characters.',
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    }

    setErrors(nextErrors)
    setError('')

    if (nextErrors.email || nextErrors.code || nextErrors.name || nextErrors.username || nextErrors.password || nextErrors.confirmPassword) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post<AuthResponse>('/team/invite/accept', {
        email,
        code,
        name,
        username,
        password,
      })
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
            Join your team
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-text-muted">
            Enter the invitation code from your email to create your account
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-lg sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-dark-text">Full name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-dark-text-muted">
                  <User size={18} />
                </div>
                <input
                  className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface pl-10 pr-4 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setErrors((current) => ({ ...current, name: validateFirstName(name) }))}
                  required
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-dark-text">Username</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-dark-text-muted">
                  <User size={18} />
                </div>
                <input
                  className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface pl-10 pr-4 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  type="text"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  maxLength={20}
                  required
                />
              </div>
              {errors.username && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.username}</p>}
              <p className="mt-1 text-xs text-slate-400 dark:text-dark-text-muted">Letters, numbers, and underscores only. 3-20 characters.</p>
            </div>

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
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setErrors((current) => ({ ...current, email: validateEmail(email) }))}
                  required
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            {/* Invitation Code */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-dark-text">Invitation code</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-dark-text-muted">
                  <KeyRound size={18} />
                </div>
                <input
                  className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface pl-10 pr-4 text-center text-lg font-semibold tracking-widest text-slate-900 dark:text-dark-text-heading shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => setErrors((current) => ({ ...current, code: validateVerificationCode(code) }))}
                  required
                />
              </div>
              {errors.code && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.code}</p>}
            </div>

            {/* Password */}
            <PasswordField
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setErrors((current) => ({ ...current, password: validatePassword(password) }))}
              error={errors.password ?? ''}
              required
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <PasswordField
              label="Confirm password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setErrors((current) => ({ ...current, confirmPassword: validatePasswordConfirmation(password, confirmPassword) }))}
              error={errors.confirmPassword ?? ''}
              required
              autoComplete="new-password"
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
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </div>
              ) : (
                <>
                  Create account & join team
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-dark-text-muted">
            Already have an account?{' '}
            <Link className="font-semibold text-emerald-600 dark:text-emerald-400 transition-colors hover:text-emerald-700 dark:hover:text-emerald-300" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  )
}