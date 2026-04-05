import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthPageShell } from '../components/AuthPageShell'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../hooks/useAuth'
import { api, getApiErrorMessage } from '../lib/api'
import {
  validateEmail,
  validateFirstName,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from '../lib/validation'
import type { ApiMessageResponse, AuthResponse } from '../types'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState<'details' | 'verify'>('details')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', code: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = {
      name: validateFirstName(form.name),
      email: validateEmail(form.email),
    }
    setErrors(nextErrors)
    setError('')
    setMessage('')

    if (nextErrors.name || nextErrors.email) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post<ApiMessageResponse>('/auth/register/request-code', {
        name: form.name,
        email: form.email,
      })
      setMessage(response.data.message)
      setStep('verify')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = {
      code: validateVerificationCode(form.code),
      password: validatePassword(form.password),
      confirmPassword: validatePasswordConfirmation(form.password, form.confirmPassword),
    }
    setErrors(nextErrors)
    setError('')
    setMessage('')

    if (nextErrors.code || nextErrors.password || nextErrors.confirmPassword) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        code: form.code,
      })
      login(response.data.token, response.data.user)
      navigate('/dashboard')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await api.post<ApiMessageResponse>('/auth/register/request-code', {
        name: form.name,
        email: form.email,
      })
      setMessage(response.data.message)
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
            <span className="text-xl">✨</span>
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900 dark:text-dark-text-heading">
            {step === 'details' ? 'Create your account' : 'Verify your email'}
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-dark-text-muted">
            {step === 'details'
              ? 'Start your journey towards sustainable living'
              : 'Enter the 6-digit code sent to your email'}
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            <span className="text-lg">✅</span>
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        {/* Step 1: Details */}
        {step === 'details' ? (
          <form className="space-y-5" onSubmit={handleRequestCode}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-dark-text">First name</label>
              <input
                className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 text-sm text-neutral-900 dark:text-dark-text shadow-sm transition-colors placeholder:text-neutral-400 dark:placeholder:text-dark-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                type="text"
                placeholder="Your first name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                onBlur={() =>
                  setErrors((current) => ({ ...current, name: validateFirstName(form.name) }))
                }
                required
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-dark-text">Email address</label>
              <input
                className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 text-sm text-neutral-900 dark:text-dark-text shadow-sm transition-colors placeholder:text-neutral-400 dark:placeholder:text-dark-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                onBlur={() =>
                  setErrors((current) => ({ ...current, email: validateEmail(form.email) }))
                }
                required
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <button
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending code...
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Verify */
          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-dark-text">First name</label>
              <input className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface px-4 text-sm text-neutral-500 dark:text-dark-text-muted" type="text" value={form.name} readOnly aria-label="First name" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-dark-text">Email</label>
              <input className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface px-4 text-sm text-neutral-500 dark:text-dark-text-muted" type="email" value={form.email} readOnly aria-label="Email address" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-dark-text">Verification code</label>
              <input
                className="flex h-11 w-full rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 text-center text-lg font-semibold tracking-widest text-neutral-900 dark:text-dark-text-heading shadow-sm transition-colors placeholder:text-neutral-400 dark:placeholder:text-dark-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value.replace(/\D/g, ''),
                  }))
                }
                onBlur={() =>
                  setErrors((current) => ({
                    ...current,
                    code: validateVerificationCode(form.code),
                  }))
                }
                required
              />
              {errors.code && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.code}</p>}
            </div>

            <PasswordField
              label="Password"
              placeholder="Use upper, lower, number, and symbol"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              onBlur={() =>
                setErrors((current) => ({
                  ...current,
                  password: validatePassword(form.password),
                }))
              }
              error={errors.password ?? ''}
              required
              autoComplete="new-password"
            />

            <PasswordField
              label="Confirm password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              onBlur={() =>
                setErrors((current) => ({
                  ...current,
                  confirmPassword: validatePasswordConfirmation(form.password, form.confirmPassword),
                }))
              }
              error={errors.confirmPassword ?? ''}
              required
              autoComplete="new-password"
            />

            <button
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>

            <button
              className="flex w-full items-center justify-center rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface px-5 py-3 text-sm font-semibold text-neutral-700 dark:text-dark-text shadow-sm transition-all hover:bg-neutral-50 dark:hover:bg-dark-bg disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={handleResendCode}
              disabled={isSubmitting}
            >
              Resend verification code
            </button>

            <button
              className="w-full text-center text-sm font-medium text-primary-600 dark:text-primary-400 transition-colors hover:text-primary-700 dark:hover:text-primary-300"
              type="button"
              onClick={() => {
                setStep('details')
                setMessage('')
                setError('')
              }}
            >
              Edit first name or email
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500 dark:text-dark-text-muted">
            Already have an account?{' '}
            <Link className="font-semibold text-primary-600 dark:text-primary-400 transition-colors hover:text-primary-700 dark:hover:text-primary-300" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  )
}