
import { Navigate, Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import { DashboardPage } from './pages/DashboardPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ImpactPage } from './pages/ImpactPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { LoginPage } from './pages/LoginPage'
import { LogWastePage } from './pages/LogWastePage'
import { MapPage } from './pages/MapPage'
import { RegisterPage } from './pages/RegisterPage'
import { TeamInvitePage } from './pages/TeamInvitePage'
import { TeamLoginPage } from './pages/TeamLoginPage'
import { TeamManagementPage } from './pages/TeamManagementPage'
import { UsernameSetupPage } from './pages/UsernameSetupPage'
import { ContactPage } from './pages/ContactPage'

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/team-invite"
        element={
          <PublicRoute>
            <TeamLoginPage />
          </PublicRoute>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/log-waste" element={<LogWastePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/team" element={<TeamManagementPage />} />
          <Route path="/team/invite" element={<TeamInvitePage />} />
        </Route>
      </Route>
      <Route path="/setup-username" element={<UsernameSetupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
