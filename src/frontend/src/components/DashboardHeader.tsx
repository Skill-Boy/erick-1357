import { User } from '../types/app.types'

interface DashboardHeaderProps {
  user: User;
  onLogout: () => void;
}

function getInitials(fullName: string): string {
  return fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <p className="breadcrumb">Dashboard / General</p>
        <h1>Dashboard general</h1>
      </div>
      <div className="profile">
        <span className="profile-avatar">{getInitials(user.fullName)}</span>
        <div><strong>{user.fullName}</strong><small>{user.email}</small></div>
        <button type="button" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </header>
  )
}