import type { InputHTMLAttributes } from 'react'
import { useState } from 'react'

import { FieldError } from './FieldError'

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
  error?: string
}

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {!open ? <path d="M4 4l16 16" /> : null}
  </svg>
)

export const PasswordField = ({ label, error = '', className = '', ...props }: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      {label && <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-dark-text">{label}</label>}
      <div className="relative">
        <input
          {...props}
          type={visible ? 'text' : 'password'}
          className={`flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-4 pr-12 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${className}`.trim()}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
      <FieldError message={error} />
    </div>
  )
}
