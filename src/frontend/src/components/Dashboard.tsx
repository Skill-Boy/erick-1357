import { User } from '../types/app.types'
import { DashboardHeader } from './DashboardHeader'
import { PaymentForm } from './PaymentForm'
import { RaceStatistics } from './RaceStatistics'
import { Sidebar } from './Sidebar'

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onBalanceUpdated: (amount: number) => void;
}

export function Dashboard({ user, onLogout, onBalanceUpdated }: DashboardProps) {
  const balance = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(user.balance)

  return (
    <main className="dashboard-shell">
      <Sidebar />
      <section className="dashboard-content">
        <DashboardHeader user={user} onLogout={onLogout} />
        <RaceStatistics balance={balance} />
        <PaymentForm user={user} onBalanceUpdated={onBalanceUpdated} />
      </section>
    </main>
  )
}