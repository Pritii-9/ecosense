import type { ReactNode } from 'react'

import { AuthHero } from './AuthHero'
import { ThemeToggle } from './ThemeToggle'

export const AuthPageShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/40 dark:bg-emerald-900/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-100/40 dark:bg-blue-900/10 blur-3xl" />

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Left Hero Section */}
        <div className="hidden w-full lg:flex lg:w-1/2">
          <AuthHero />
        </div>

        {/* Right Form Section */}
        <div className="flex w-full flex-col lg:w-1/2">
          {/* Top Bar */}
          <div className="flex w-full items-center justify-end px-6 py-4 sm:px-8">
            <ThemeToggle />
          </div>

          {/* Form Container */}
          <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-8 lg:px-12 xl:px-20">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
