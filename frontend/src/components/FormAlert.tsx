interface FormAlertProps {
  tone?: 'error' | 'success' | 'info'
  message: string
}

const toneClasses: Record<NonNullable<FormAlertProps['tone']>, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-moss-200 bg-moss-50 text-moss-700',
}

export const FormAlert = ({ tone = 'error', message }: FormAlertProps) => {
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>{message}</div>
}
