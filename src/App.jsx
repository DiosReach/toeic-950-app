import { useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'

export default function App() {
  const { user, loading } = useAuth()

  // Wait for Firebase to resolve the persisted session before deciding which
  // screen to show — avoids a login-screen flash for returning users.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse">Loading…</div>
      </div>
    )
  }

  // The gateway: no authenticated user → no words, only the auth screen.
  return user ? <Dashboard /> : <AuthPage />
}
