import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, ArrowRight, Mail, User, KeyRound, Shield, Zap, Globe2 } from 'lucide-react'

import { ThemeToggle } from '../components/ThemeToggle'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { api, getApiErrorMessage } from '../lib/api'
import { validateEmail, validateFirstName, validatePassword, validatePasswordConfirmation, validateVerificationCode } from '../lib/validation'
import type { AuthResponse } from '../types'

const features = [
  { icon: Shield, title: 'Verified Logging', desc: 'End-to-end encrypted waste verification' },
  { icon: Zap, title: 'Live Sync', desc: 'Instant point updates via Socket.IO' },
  { icon: Globe2, title: 'Global Network', desc: 'Access certified recycling terminals' },
]

export const TeamLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
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
              <Leaf size={24} fill="currentColor" />
            </div>
            <h2 className={`mt-4 text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Join your team
            </h2>
            <p className={`mt-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Enter the invitation code from your email
            </p>
          </div>

          {/* Card Container */}
          <div className={`rounded-2xl border p-5 shadow-xl sm:p-7 transition-colors ${isDark ? 'border-white/10 bg-white/5 backdrop-blur-xl' : 'border-slate-200 bg-white/80 backdrop-blur-xl'}`}>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <label className={`mb-1.5 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full name</label>
                <div className="relative">
                  <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <User size={18} />
                  </div>
                  <input
                    className={`flex h-11 w-full rounded-xl border pl-10 pr-4 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white'}`}
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setErrors((current) => ({ ...current, name: validateFirstName(name) }))}
                    required
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>

              {/* Username */}
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
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    maxLength={20}
                    required
                  />
                </div>
                {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={`mb-1.5 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email address</label>
                <div className="relative">
                  <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Mail size={18} />
                  </div>
                  <input
                    className={`flex h-11 w-full rounded-xl border pl-10 pr-4 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white'}`}
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setErrors((current) => ({ ...current, email: validateEmail(email) }))}
                    required
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              {/* Invitation Code */}
              <div>
                <label className={`mb-1.5 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Invitation code</label>
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
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    onBlur={() => setErrors((current) => ({ ...current, code: validateVerificationCode(code) }))}
                    required
                  />
                </div>
                {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code}</p>}
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
                className={isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}
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
                className={isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}
              />

              {/* Error Message */}
              {error && (
                <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${isDark ? 'border-red-800 bg-red-900/20 text-red-400' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  <span className="text-lg">⚠️</span>
                  {error}
                </div>
              )}

              {/* Submit Button */}
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
                    Create account & join team
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
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

          {/* Features Grid */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {features.map((feature) => (
              <div key={feature.title} className={`flex flex-col items-center rounded-xl p-3 text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                  <feature.icon size={16} />
                </div>
                <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>{feature.title}</p>
                <p className={`mt-0.5 text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}