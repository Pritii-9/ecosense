import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, Leaf, Trophy, Users, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface Notification {
  id: string
  type: 'achievement' | 'milestone' | 'team' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
}

const getIcon = (type: string) => {
  switch (type) {
    case 'achievement':
      return <Trophy size={16} className="text-amber-500" />
    case 'milestone':
      return <Leaf size={16} className="text-emerald-500" />
    case 'team':
      return <Users size={16} className="text-blue-500" />
    default:
      return <Bell size={16} className="text-slate-500" />
  }
}

const getRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export const NotificationDropdown = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Generate notifications based on user data
  useEffect(() => {
    if (!user) return

    const generated: Notification[] = []

    // Welcome notification
    generated.push({
      id: 'welcome',
      type: 'system',
      title: 'Welcome to EcoSense!',
      message: `Hi ${user.name}, start logging your waste to earn points and climb the leaderboard.`,
      read: user.total_points > 0,
      createdAt: new Date().toISOString(),
    })

    // Points milestone
    if (user.total_points >= 100) {
      generated.push({
        id: 'milestone-100',
        type: 'milestone',
        title: '🎉 100 Points Milestone!',
        message: `You've earned ${user.total_points} points! Keep up the great work.`,
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      })
    }

    // Team notification if in org
    if (user.org_id) {
      generated.push({
        id: 'team-join',
        type: 'team',
        title: 'Team Active',
        message: 'You are part of a team. Check the leaderboard to see how your team is doing!',
        read: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      })
    }

    setNotifications(generated)
  }, [user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text-heading hover:bg-slate-100 dark:hover:bg-dark-card rounded-xl transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-dark-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-border px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text-heading">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-dark-text-heading rounded-lg hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors"
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={32} className="mx-auto text-slate-300 dark:text-dark-text-muted mb-2" />
                  <p className="text-sm text-slate-500 dark:text-dark-text-muted">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-slate-100 dark:border-dark-border/50 px-4 py-3 transition-colors ${
                      !notification.read
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10'
                        : 'hover:bg-slate-50 dark:hover:bg-dark-surface/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-dark-text-heading">
                            {notification.title}
                          </p>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="flex-shrink-0 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            aria-label="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-dark-text-muted line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 dark:text-dark-text-muted">
                            {getRelativeTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                            >
                              <Check size={10} />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}