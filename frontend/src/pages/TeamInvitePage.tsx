import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Mail, Plus, Trash2, Send, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

import { AuthPageShell } from '../components/AuthPageShell'
import { useAuth } from '../hooks/useAuth'
import { api, getApiErrorMessage } from '../lib/api'
import type { TeamInviteResult, PendingInvite } from '../types'

export const TeamInvitePage = () => {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [emails, setEmails] = useState<string[]>([''])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<TeamInviteResult | null>(null)
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (user?.role !== 'admin' && user?.role !== 'ceo') {
      navigate('/dashboard')
      return
    }
    fetchPendingInvites()
  }, [token, user, navigate])

  const fetchPendingInvites = async () => {
    try {
      const response = await api.get<{ invites: PendingInvite[] }>('/team/invites/pending')
      setPendingInvites(response.data.invites)
    } catch (err) {
      console.error('Failed to fetch pending invites:', err)
    }
  }

  const addEmailField = () => {
    setEmails((current) => [...current, ''])
  }

  const removeEmailField = (index: number) => {
    setEmails((current) => current.filter((_, i) => i !== index).length > 0 ? current.filter((_, i) => i !== index) : [''])
  }

  const updateEmail = (index: number, value: string) => {
    setEmails((current) => current.map((email, i) => (i === index ? value : email)))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const filteredEmails = emails.filter((e) => e.trim())

    if (filteredEmails.length === 0) {
      setError('Please add at least one email address.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setMessage('')
    setResult(null)

    try {
      const response = await api.post<{ message: string; results: TeamInviteResult }>('/team/invite', {
        emails: filteredEmails,
      })
      setResult(response.data.results)
      setMessage(response.data.message)
      setEmails([''])
      fetchPendingInvites()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendInvite = async (email: string) => {
    try {
      await api.post('/team/invite/resend', { email })
      setMessage(`Invitation resent to ${email}`)
      fetchPendingInvites()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    }
  }

  const handleCancelInvite = async (email: string) => {
    try {
      await api.post('/team/invite/cancel', { email })
      setMessage(`Invitation cancelled for ${email}`)
      fetchPendingInvites()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    }
  }

  return (
    <AuthPageShell>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-500/30">
            <Users size={28} />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-dark-text-heading">
            Invite Team Members
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-text-muted">
            Add team members by email - they'll receive an invitation code to join
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-dark-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Card Container */}
        <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-lg sm:p-8">
          {/* Success Message */}
          {message && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              <CheckCircle size={18} />
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Result Summary */}
          {result && (
            <div className="mb-5 space-y-3">
              {result.invited.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
                  <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-emerald-700 dark:text-emerald-400">
                    Invitations sent to: {result.invited.join(', ')}
                  </span>
                </div>
              )}
              {result.already_exists.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
                  <AlertCircle size={18} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-sm text-amber-700 dark:text-amber-400">
                    Already exists: {result.already_exists.join(', ')}
                  </span>
                </div>
              )}
              {result.failed.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
                  <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-700 dark:text-red-400">
                    Failed: {result.failed.map((f) => `${f.email} (${f.reason})`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Email Input Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-dark-text">Team member emails</label>
              <button
                type="button"
                onClick={addEmailField}
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                <Plus size={16} />
                Add another
              </button>
            </div>

            {emails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-dark-text-muted">
                    <Mail size={18} />
                  </div>
                  <input
                    className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface pl-10 pr-4 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    required
                  />
                </div>
                {emails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmailField(index)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 dark:border-dark-border text-slate-400 transition-colors hover:border-red-300 hover:text-red-500 dark:hover:border-red-700"
                    aria-label={`Remove email field ${index + 1}`}
                    title="Remove email"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            <button
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending invitations...
                </div>
              ) : (
                <>
                  Send Invitations
                  <Send size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-dark-text">Pending Invitations</h3>
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <Mail size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-dark-text">{invite.email}</p>
                        <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                          Expires: {new Date(invite.expires_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResendInvite(invite.email)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => handleCancelInvite(invite.email)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthPageShell>
  )
}