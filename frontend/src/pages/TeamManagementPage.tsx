import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Mail, Plus, Trash2, Send, CheckCircle, AlertCircle, UserPlus, Crown, Star, Search } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { api, getApiErrorMessage } from '../lib/api'
import type { TeamMember, TeamInviteResult, PendingInvite } from '../types'

export const TeamManagementPage = () => {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [emails, setEmails] = useState<string[]>([''])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [inviteResult, setInviteResult] = useState<TeamInviteResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (user?.role !== 'admin' && user?.role !== 'ceo') {
      navigate('/dashboard')
      return
    }
    fetchData()
  }, [token, user, navigate])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchTeamMembers(), fetchPendingInvites()])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get<{ members: TeamMember[]; org_id: string }>('/team/members')
      setTeamMembers(response.data.members)
    } catch (err) {
      console.error('Failed to fetch team members:', err)
    }
  }

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

  const handleInviteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const filteredEmails = emails.filter((e) => e.trim())

    if (filteredEmails.length === 0) {
      setError('Please add at least one email address.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setMessage('')
    setInviteResult(null)

    try {
      const response = await api.post<{ message: string; results: TeamInviteResult }>('/team/invite', {
        emails: filteredEmails,
      })
      setInviteResult(response.data.results)
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

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  const getRoleIcon = (role: string) => {
    if (role === 'ceo') return <Crown size={14} className="text-amber-500" />
    if (role === 'admin') return <Star size={14} className="text-emerald-500" />
    return <Users size={14} className="text-slate-400" />
  }

  const getRoleBadgeColor = (role: string) => {
    if (role === 'ceo') return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    if (role === 'admin') return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    return 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-500" />
          <p className="text-sm font-medium text-slate-500 dark:text-dark-text-muted">Loading team data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-dark-text-heading sm:text-3xl">
            Team Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-dark-text-muted">
            Manage your team members and send invitations
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-1 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-dark-text-muted hover:bg-slate-100 dark:hover:bg-dark-surface'
          }`}
        >
          <Users size={16} />
          Members ({teamMembers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('invites')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'invites'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-dark-text-muted hover:bg-slate-100 dark:hover:bg-dark-surface'
          }`}
        >
          <Mail size={16} />
          Invites ({pendingInvites.length})
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
          {/* Search Bar */}
          <div className="p-6 border-b border-slate-200 dark:border-dark-border">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-dark-text-muted">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface pl-10 pr-4 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Members List */}
          <div className="divide-y divide-slate-200 dark:divide-dark-border">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-dark-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-200 dark:border-emerald-700/50 shadow-sm font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-dark-text-heading">{member.name}</p>
                        {getRoleIcon(member.role ?? 'user')}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-dark-text-muted">{member.email}</p>
                      {member.department && (
                        <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-0.5">{member.department}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getRoleBadgeColor(member.role ?? 'user')}`}>
                      {getRoleIcon(member.role ?? 'user')}
                      {member.role ?? 'user'}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{member.total_points.toLocaleString()}</p>
                      <p className="text-xs text-slate-400 dark:text-dark-text-muted">points</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Users size={48} className="text-slate-300 dark:text-dark-text-muted mb-4" />
                <p className="text-sm font-medium text-slate-500 dark:text-dark-text-muted">
                  {searchQuery ? 'No members match your search' : 'No team members yet'}
                </p>
                <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">
                  {searchQuery ? 'Try a different search term' : 'Invite team members to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invites Tab */}
      {activeTab === 'invites' && (
        <div className="space-y-6">
          {/* Invite Form */}
          <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-lg sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-xl shadow-emerald-500/30">
                <UserPlus size={28} />
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-dark-text-heading">
                Invite Team Members
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-dark-text-muted">
                Add team members by email - they'll receive an invitation code to join
              </p>
            </div>

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

            {/* Invite Result */}
            {inviteResult && (
              <div className="mb-5 space-y-3">
                {inviteResult.invited.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
                    <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">
                      Invitations sent to: {inviteResult.invited.join(', ')}
                    </span>
                  </div>
                )}
                {inviteResult.already_exists.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
                    <AlertCircle size={18} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-700 dark:text-amber-400">
                      Already exists: {inviteResult.already_exists.join(', ')}
                    </span>
                  </div>
                )}
                {inviteResult.failed.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
                    <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-400">
                      Failed: {inviteResult.failed.map((f) => `${f.email} (${f.reason})`).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Email Input Form */}
            <form className="space-y-4" onSubmit={handleInviteSubmit}>
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
          </div>

          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
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
      )}
    </div>
  )
}