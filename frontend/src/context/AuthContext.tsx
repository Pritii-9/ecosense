import type { ReactNode } from 'react'
import { createContext, useCallback, useEffect, useState } from 'react'

import { api, setAuthToken } from '../lib/api'
import type { AuthResponse, User } from '../types'

interface AuthContextValue {
  token: string | null
  user: User | null
  authReady: boolean
  login: (token: string, user: User) => void
  logout: () => Promise<void>
  syncUserPoints: (totalPoints: number) => void
  setUser: (user: User | null) => void
}

const storageKey = 'ecosense-auth'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const rawSession = window.localStorage.getItem(storageKey)

    if (!rawSession) {
      setAuthToken(null)
      setAuthReady(true)
      return
    }

    try {
      const session = JSON.parse(rawSession) as Pick<AuthResponse, 'token' | 'user'>
      setToken(session.token)
      setUser(session.user)
      setAuthToken(session.token)
      
      // Refresh user data from backend to get updated org_id and role
      api.get('/auth/me')
        .then(response => {
          const freshUser = response.data.user as User
          setUser(freshUser)
          window.localStorage.setItem(storageKey, JSON.stringify({ token: session.token, user: freshUser }))
        })
        .catch(() => {
          // If refresh fails, continue with cached user data
        })
        .finally(() => {
          setAuthReady(true)
        })
    } catch {
      window.localStorage.removeItem(storageKey)
      setAuthToken(null)
      setAuthReady(true)
    }
  }, [])

  const login = (nextToken: string, nextUser: User) => {
    setToken(nextToken)
    setUser(nextUser)
    setAuthToken(nextToken)
    window.localStorage.setItem(storageKey, JSON.stringify({ token: nextToken, user: nextUser }))
  }

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout')
      }
    } catch {
      // Logout is still safe client-side even if the request fails.
    } finally {
      setToken(null)
      setUser(null)
      setAuthToken(null)
      window.localStorage.removeItem(storageKey)
    }
  }

  const syncUserPoints = useCallback((totalPoints: number) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser
      }

      const updatedUser = { ...currentUser, total_points: totalPoints }
      window.localStorage.setItem(storageKey, JSON.stringify({ token, user: updatedUser }))
      return updatedUser
    })
  }, [token])

  return (
    <AuthContext.Provider value={{ token, user, authReady, login, logout, syncUserPoints, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
