import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, KeyRound, Leaf } from 'lucide-react'

import { ThemeToggle } from '../components/ThemeToggle'
import { PasswordField } from '../components/PasswordField'
import { useTheme } from '../hooks/useTheme'
import { api, getApiErrorMessage } from '../lib/api'
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from '../lib/validation'
import type { ApiMessageResponse } from '../types'

export const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = { email: validateEmail(email) }
    setErrors(nextErrors)
    setError('')
    setMessage('')

    if (nextErrors.email) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await api.post<ApiMessageResponse>('/auth/forgot-password/request-code', { email })
      setMessage(response.data.message)
      setStep('reset')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = {
      code: validateVerificationCode(code),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    }
    setErrors(nextErrors)
    setError('')
    setMessage('')

    if (nextErrors.code || nextErrors.password || nextErrors.confirmPassword) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await api.post<ApiMessageResponse>('/auth/forgot-password/reset', {
        email,
        code,
        password,
      })
      setMessage(response.data.message)
      window.setTimeout(() => navigate('/login'), 1200)
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
      const response = await api.post<ApiMessageResponse>('/auth/forgot-password/request-code', { email })
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
              <KeyRound size={24} />
            </div>
            <h2 className={`mt-4 text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {step === 'request' ? 'Reset your password' : 'Enter verification code'}
            </h2>
            <p className={`mt-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {step === 'request'
                ? 'Enter your email to receive a 6-digit verification code'
                : 'Enter the code sent to your email and choose a new password'}
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

            {/* Step 1: Request Code */}
            {step === 'request' ? (
              <form className="space-y-4" onSubmit={handleRequestCode}>
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
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onBlur={() => setErrors((current) => ({ ...current, email: validateEmail(email) }))}
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
                      Send reset code
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Reset Password */
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div>
                  <label className={`mb-1.5 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
                  <div className="relative">
                    <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Mail size={18} />
                    </div>
                    <input
                      className={`flex h-11 w-full rounded-xl border pl-10 pr-4 text-sm shadow-sm ${isDark ? 'border-white/10 bg-white/5 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                      type="email"
                      value={email}
                      readOnly
                      aria-label="Email address"
                    />
                  </div>
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
                      value={code}
                      onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                      onBlur={() =>
                        setErrors((current) => ({ ...current, code: validateVerificationCode(code) }))
                      }
                      required
                    />
                  </div>
                  {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code}</p>}
                </div>

                <PasswordField
                  label="New password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={() =>
                    setErrors((current) => ({ ...current, password: validatePassword(password) }))
                  }
                  placeholder="Create a strong password"
                  error={errors.password ?? ''}
                  required
                  autoComplete="new-password"
                  className={isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}
                />

                <PasswordField
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  onBlur={() =>
                    setErrors((current) => ({
                      ...current,
                      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
                    }))
                  }
                  placeholder="Repeat your new password"
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
                      Updating password...
                    </div>
                  ) : (
                    <>
                      Update password
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
                  Resend code
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Remember your password?{' '}
              <Link className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300" to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}