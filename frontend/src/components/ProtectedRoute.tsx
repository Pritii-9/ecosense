import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export const ProtectedRoute = () => {
  const { authReady, token } = useAuth()

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-panel px-6 py-5 text-sm font-semibold text-moss-700">
          Loading your EcoSense workspace...
        </div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
