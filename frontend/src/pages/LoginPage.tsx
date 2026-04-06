import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, User, ArrowRight, Shield, Zap, Globe2, Users, TrendingUp, Recycle, Award, CheckCircle2 } from 'lucide-react'

import { ThemeToggle } from '../components/ThemeToggle'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { api, getApiErrorMessage } from '../lib/api'
import type { AuthResponse } from '../types'

const features = [
  { icon: Shield, title: 'Verified Logging', desc: 'End-to-end encrypted waste verification' },
  { icon: Zap, title: 'Live Sync', desc: 'Instant point updates via Socket.IO' },
  { icon: Globe2, title: 'Global Network', desc: 'Access certified recycling terminals' },
]

const stats = [
  { icon: Users, value: '50K+', label: 'Active Users' },
  { icon: TrendingUp, value: '2.5M', label: 'Kg Recycled' },
  { icon: Recycle, value: '120+', label: 'Countries' },
]

const partners = ['TechCorp', 'GreenEnergy', 'EcoSolutions', 'SustainCo', 'CleanTech']

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = {
      username: username ? '' : 'Username or email is required.',
      password: password ? '' : 'Password is required.',
    }

    setErrors(nextErrors)
    setError('')

    if (nextErrors.username || nextErrors.password) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post<AuthResponse>('/auth/login', { identifier: username, password })
      login(response.data.token, response.data.user)
      navigate('/dashboard')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`relative flex min-h-[100dvh] overflow-hidden transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/30'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-0 h-96 w-96 rounded-full blur-[120px] ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-200/30'}`} />
        <div className={`absolute bottom-0 right-0 h-96 w-96 rounded-full blur-[120px] ${isDark ? 'bg-teal-500/10' : 'bg-teal-200/30'}`} />
        <div 
          className={`absolute inset-0 ${isDark ? 'opacity-[0.02]' : 'opacity-[0.03]'}`}
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/25">
            <Leaf size={22} fill="currentColor" />
          </div>
          <span className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>EcoSense</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className={`hidden sm:inline text-xs uppercase tracking-wider ${isDark ? 'text-emerald-400/80' : 'text-emerald-600/80'}`}>Platform Active</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 flex w-full flex-1 justify-center overflow-y-auto px-4 py-20">
        <div className="flex w-full flex-col items-center justify-center lg:flex-row">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Content - Landing Info */}
          <div className="hidden w-full max-w-xl lg:block lg:max-w-none">
            <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${isDark ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50'}`}>
              <CheckCircle2 size={14} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
              <span className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Trusted by 50,000+ organizations</span>
            </div>
            
            <h1 className={`text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Precision Metrics for
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Sustainability.
              </span>
            </h1>
            
            <p className={`mt-6 text-lg leading-relaxed max-w-md ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              A professional-grade framework for monitoring environmental impact. Log waste, analyze real-time metrics, and contribute to a verified circular economy.
            </p>

            {/* Feature List */}
            <div className="mt-10 space-y-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-center gap-4 group">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${isDark ? 'bg-white/5 border-white/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30' : 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover:bg-emerald-100'}`}>
                    <feature.icon size={20} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Partners */}
            <div className={`border-t pt-6 mt-8 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <p className={`text-[10px] uppercase tracking-widest mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Trusted by industry leaders</p>
              <div className="flex items-center gap-6">
                {partners.map((partner) => (
                  <span key={partner} className={`text-sm font-medium transition-colors cursor-default ${isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}>
                    {partner}
                  </span>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className={`mt-6 flex items-center gap-6 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              <div className="flex items-center gap-2">
                <Shield size={14} />
                <span className="text-[10px]">SOC 2</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={14} />
                <span className="text-[10px]">ISO 14001</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf size={14} />
                <span className="text-[10px]">Carbon Neutral</span>
              </div>
            </div>
          </div>

          {/* Right Content - Login Card */}
          <div className="w-full max-w-md mx-auto mt-8 lg:mt-0 lg:mx-0 lg:ml-auto">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8 text-center">
              <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${isDark ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-50'}`}>
                <CheckCircle2 size={14} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                <span className={`text-xs font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Trusted by 50,000+ organizations</span>
              </div>
              <h1 className={`text-4xl font-extrabold leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Precision Metrics for
                <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Sustainability.
                </span>
              </h1>
            </div>

            {/* Login Card */}
            <div className={`rounded-2xl border p-6 shadow-2xl sm:p-8 backdrop-blur-xl transition-colors ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/80'}`}>
              <div className="mb-6">
                <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Welcome back
                </h2>
                <p className={`mt-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Sign in to your account to continue
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Username or Email */}
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Username or Email</label>
                  <div className="relative">
                    <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <User size={18} />
                    </div>
                    <input
                      className={`flex h-12 w-full rounded-xl border pl-10 pr-4 text-sm shadow-sm transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'border-white/10 bg-white/5 text-white focus:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'}`}
                      type="text"
                      placeholder="Enter your username or email"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      onBlur={() => setErrors((current) => ({ ...current, username: username ? '' : 'Username or email is required.' }))}
                      required
                    />
                  </div>
                  {errors.username && <p className="mt-1.5 text-xs text-red-400">{errors.username}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                  <PasswordField
                    label=""
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
                    className={isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className={`h-4 w-4 rounded text-emerald-500 focus:ring-emerald-500 ${isDark ? 'border-slate-600 bg-white/5' : 'border-slate-300'}`} />
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Remember me</span>
                  </label>
                  <Link className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300" to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
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
            <div className="mt-6 space-y-3 text-center">
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Don't have an account?{' '}
                <Link className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300" to="/register">
                  Create one now
                </Link>
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Have an invitation code?{' '}
                <Link className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300" to="/team-invite">
                  Join your team
                </Link>
              </p>
            </div>

            {/* Mobile Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 lg:hidden">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
