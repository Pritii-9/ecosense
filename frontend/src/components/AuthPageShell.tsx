import type { ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { Leaf } from 'lucide-react'

export const AuthPageShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative flex min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
      {/* Subtle Background Decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/30 dark:bg-emerald-900/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-100/30 dark:bg-teal-900/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-50/20 dark:bg-emerald-900/5 blur-3xl" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/25">
            <Leaf size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-dark-text-heading">EcoSense</span>
        </div>
        
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>

      {/* Centered Form Container */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}