import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, User, KeyRound, CheckCircle, Shield, Zap, Globe2, Leaf } from 'lucide-react'

import { ThemeToggle } from '../components/ThemeToggle'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { api, getApiErrorMessage } from '../lib/api'
import {
  validateEmail,
  validateFirstName,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from '../lib/validation'
import type { ApiMessageResponse, AuthResponse } from '../types'

const features = [
  { icon: Shield, title: 'Verified Logging', desc: 'End-to-end encrypted waste verification' },
  { icon: Zap, title: 'Live Sync', desc: 'Instant point updates via Socket.IO' },
  { icon: Globe2, title: 'Global Network', desc: 'Access certified recycling terminals' },
]

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [step, setStep] = useState<'details' | 'verify'>('details')
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '', code: '' })
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
      username: form.username && form.username.length >= 3 && form.username.length <= 20 ? '' : 'Username must be 3-20 characters.',
      code: validateVerificationCode(form.code),
      password: validatePassword(form.password),
      confirmPassword: validatePasswordConfirmation(form.password, form.confirmPassword),
    }
    setErrors(nextErrors)
    setError('')
    setMessage('')

    if (nextErrors.username || nextErrors.code || nextErrors.password || nextErrors.confirmPassword) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        name: form.name,
        email: form.email,
        username: form.username,
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
    <div className={`relative flex min-h-[100dvh] overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/30'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-0 h-96 w-96 rounded-full blur-[120px] ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-200/30'}`} />
        <div className={`absolute bottom-0 right-0 h-96 w-96 rounded-full blur-[120px] ${isDark ? 'bg-teal-500/10' : 'bg-teal-200/30'}`} />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/25">
            <Leaf size={20} fill="currentColor" />
          </div>
          <span className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>EcoSense</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Form Container */}
      <div className="relative z-10 flex w-full flex-1 justify-center overflow-y-auto px-4 py-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-500/30">
              {step === 'details' ? <User size={24} /> : <CheckCircle size={24} />}
            </div>
            <h2 className={`mt-4 text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {step === 'details' ? 'Create your account' : 'Verify your email'}
            </h2>
            <p className={`mt-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {step === 'details'
                ? 'Start your journey towards sustainable living'
                : 'Enter the 6-digit code sent to your email'}
            </p>
          </div>

          {/* Card Container */}
          <div className={`rounded-2xl border p-5 shadow-xl sm:p-7 transition-colors ${isDark ? 'border-white/10 bg-white/5 backdrop-blur-xl' : 'border-slate-200 bg-white/80 backdrop-blur-xl'}`}>
            {/* Success Message */}
            {message && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${isDark ? 'border-green-800 bg-green-900/20 text-green-400' : 'border-green-200 bg-green-50 text-green-700'}`}>
                <span className="text-lg">✅</span>
                {message}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${isDark ? 'border-red-800 bg-red-900/20 text-red-400' : 'border-red-200 bg-red-50 text-red-700'}`}>
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}

            {/* Step 1: Details */}
            {step === 'details' ? (
              <form className="space-y-4" onSubmit={handleRequestCode}>
                <div>
                  <label className={`mb-1.5 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>First name</label>
                  <div className="relative">
                    <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <User size={18} />
                    </div>
                    <input
                      className={`flex h-11 w-full rounded-xl border pl-10 pr-4 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white'}`}
                      type="text"
                      placeholder="Your first name"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      onBlur={() =>
                        setErrors((current) => ({ ...current, name: validateFirstName(form.name) }))
                      }
                      required
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label className={`mb-1.5 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email address</label>
                  <div className="relative">
                    <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Mail size={18} />
                    </div>
                    <input
                      className={`flex h-11 w-full rounded-xl border pl-10 pr-4 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white'}`}
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      onBlur={() =>
                        setErrors((current) => ({ ...current, email: validateEmail(form.email) }))
                      }
                      required
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>

                <button
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending code...
                    </div>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Verify */
              <form className="space-y-4" onSubmit={handleRegister}>
                <div>
                  <label className={`mb-1.5 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>First name</label>
                  <div className="relative">
                    <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <User size={18} />
                    </div>
                    <input
                      className={`flex h-11 w-full rounded-xl border pl-10 pr-4 text-sm shadow-sm ${isDark ? 'border-white/10 bg-white/5 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                      type="text"
                      value={form.name}
                      readOnly
                      aria-label="First name"
                    />
                  </div>
                </div>

                <div>
                  <label className={`mb-1.5 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
                  <div className="relative">
                    <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Mail size={18} />
                    </div>
                    <input
                      className={`flex h-11 w-full rounded-xl border pl-10 pr-4 text-sm shadow-sm ${isDark ? 'border-white/10 bg-white/5 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                      type="email"
                      value={form.email}
                      readOnly
                      aria-label="Email address"
                    />
                  </div>
                </div>

                <div>
                  <label className={`mb-1.5 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Username</label>
                  <div className="relative">
                    <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <User size={18} />
                    </div>
                    <input
                      className={`flex h-11 w-full rounded-xl border pl-10 pr-4 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white'}`}
                      type="text"
                      placeholder="Choose a unique username"
                      value={form.username}
                      onChange={(event) => setForm((current) => ({ ...current, username: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                      maxLength={20}
                      required
                    />
                  </div>
                  {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
                </div>

                <div>
                  <label className={`mb-1.5 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Verification code</label>
                  <div className="relative">
                    <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <KeyRound size={18} />
                    </div>
                    <input
                      className={`flex h-11 w-full rounded-xl border pl-10 pr-4 text-center text-lg font-semibold tracking-widest shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white'}`}
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
                  </div>
                  {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code}</p>}
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
                  className={isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}
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
                  className={isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}
                />

                <button
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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
                      Create account
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <button
                  className={`flex w-full items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  type="button"
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                >
                  Resend verification code
                </button>

                <button
                  className="w-full text-center text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
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
          </div>

          {/* Footer */}
          <div className="mt-5 text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Already have an account?{' '}
              <Link className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300" to="/login">
                Sign in
              </Link>
            </p>
          </div>

          {/* Features */}
          <div className="mt-6 space-y-2">
            {features.map((feature) => (
              <div key={feature.title} className={`flex items-center gap-3 rounded-xl p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                  <feature.icon size={18} />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>{feature.title}</p>
                  <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}