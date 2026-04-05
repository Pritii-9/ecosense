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
      <label className="field-label">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={visible ? 'text' : 'password'}
          className={`field pr-14 ${className}`.trim()}
        />
        <button
          type="button"
          className="password-toggle"
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
