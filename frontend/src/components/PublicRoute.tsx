import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export const PublicRoute = ({ children }: { children: ReactElement }) => {
  const { authReady, token } = useAuth()

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-panel px-6 py-5 text-sm font-semibold text-moss-700">
          Preparing EcoSense...
        </div>
      </div>
    )
  }

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
