import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'
import { useAuth } from './hooks/useAuth'
import './App.css'

export function App() {
  const auth = useAuth()

  if (!auth.isReady) {
    return <div className="loading-screen">Preparando pista...</div>
  }

  return auth.user
    ? <Dashboard user={auth.user} onLogout={auth.logout} onBalanceUpdated={auth.updateBalance} />
    : <AuthScreen onLogin={auth.login} onRegister={auth.register} />
}

export default App