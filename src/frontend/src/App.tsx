import { FormEvent, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { localAuthService } from './services/local-auth.service';
import { chargeWithSnailPay } from './services/snail-pay.service';
import { PaymentResponse, User } from './types/app.types';
import './App.css';

const snailWins = [
  { name: 'Turbo', wins: 2, color: '#0b4dbb' },
  { name: 'Menta', wins: 1, color: '#16a864' },
  { name: 'Bruma', wins: 1, color: '#7646f5' },
  { name: 'Lima', wins: 1, color: '#f59023' },
  { name: 'Nube', wins: 1, color: '#0c80ce' },
  { name: 'Mora', wins: 0, color: '#a8b6ca' }
];

function getPaymentMessage(payment: PaymentResponse): string {
  if (payment.status === 'approved') return `Recarga aprobada. Referencia: ${payment.reference}`;
  if (payment.status_detail === 'insufficient_funds') {
    return 'La tarjeta no tiene fondos suficientes para esta recarga. Tu saldo no cambió.';
  }
  return `Operación no aprobada: ${payment.status_detail.split('_').join(' ')}.`;
}

function AuthScreen({
  onLogin,
  onRegister
}: {
  onLogin: (email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  onRegister: (name: string, email: string, password: string, confirmation: string) => Promise<{ ok: boolean; message: string }>;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setIsSubmitting(true);
    const result = mode === 'login'
      ? await onLogin(String(data.get('email')), String(data.get('password')))
      : await onRegister(
        String(data.get('fullName')),
        String(data.get('email')),
        String(data.get('password')),
        String(data.get('confirmation'))
      );
    setIsSubmitting(false);
    setMessage(result.message);
  }

  return (
    <main className="auth-page">
      <div className="auth-background-mark" aria-hidden="true"><span /></div>
      <section className="auth-panel" aria-label="Acceso a la cuenta">
        <div className="auth-brand"><span className="brand-mark">S</span><strong>SnailCircuit</strong></div>
        <div className="tab-row" role="tablist" aria-label="Modo de acceso">
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => { setMode('register'); setMessage(''); }}>Crear cuenta</button>
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); setMessage(''); }}>Ingresar</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          <h2>{mode === 'register' ? 'Tu primer día en la pista' : 'Qué bueno verte de nuevo'}</h2>
          {mode === 'register' && <label>Nombre completo<input name="fullName" autoComplete="name" required /></label>}
          <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
          <label>Contraseña<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required /></label>
          {mode === 'register' && <label>Confirmar contraseña<input name="confirmation" type="password" autoComplete="new-password" minLength={8} required /></label>}
          {message && <p className="form-message error" role="alert">{message}</p>}
          <button className="primary-button" disabled={isSubmitting}>{isSubmitting ? 'Procesando...' : mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}</button>
        </form>
      </section>
    </main>
  );
}

function getInitials(fullName: string): string {
  return fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function Dashboard({ user, onLogout, onBalanceUpdated }: { user: User; onLogout: () => void; onBalanceUpdated: (amount: number) => void }) {
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [isCharging, setIsCharging] = useState(false);

  async function submitCharge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setIsCharging(true);
    setPayment(null);
    setPaymentError('');
    try {
      const response = await chargeWithSnailPay({
        cardNumber: String(data.get('cardNumber')).replace(/\s/g, ''),
        expirationDate: String(data.get('expirationDate')),
        cvv: String(data.get('cvv')),
        cardholderName: String(data.get('cardholderName')),
        amount: Number(data.get('amount')),
        payerId: user.id,
        payerEmail: user.email
      });
      localAuthService.saveLastPayment(response);
      setPayment(response);
      if (response.status === 'approved') onBalanceUpdated(response.transaction_amount);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'No se pudo procesar la recarga.');
    } finally {
      setIsCharging(false);
    }
  }

  const balance = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(user.balance);
  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio"><span className="brand-mark">S</span><strong>SnailCircuit</strong></a>
        <nav aria-label="Navegación principal"><a className="nav-item active" href="#inicio"><span>Resumen</span></a><a className="nav-item" href="#carreras"><span>Carreras</span></a><a className="nav-item" href="#recarga"><span>Recargar saldo</span></a></nav>
        <div className="sidebar-footer"><span className="status-dot" />Pista en línea</div>
      </aside>
      <section className="dashboard-content">
        <header className="topbar"><div><p className="breadcrumb">Dashboard / General</p><h1>Dashboard general</h1></div><div className="profile"><span className="profile-avatar">{getInitials(user.fullName)}</span><div><strong>{user.fullName}</strong><small>{user.email}</small></div><button type="button" onClick={onLogout}>Cerrar sesión</button></div></header>
        <section className="welcome" id="inicio"><div><p className="eyebrow">Resumen del día</p><h2>Actividad de la pista</h2><p>Resultados simulados de las seis carreras programadas.</p></div><div className="balance"><span>Saldo actual</span><strong>{balance}</strong><small>Disponible para recargas simuladas</small></div></section>
        <section className="summary-strip" aria-label="Registros del día"><div><strong>6</strong><span>Carreras</span></div><div><strong>4</strong><span>Apuestas ganadas</span></div><div><strong>2</strong><span>Apuestas perdidas</span></div><div><strong>6</strong><span>Caracoles activos</span></div></section>
        <section className="stats-grid" id="carreras" aria-label="Estadísticas del día">
          <article className="chart-card"><div className="card-heading"><div><p className="card-label">Apuestas</p><h2>Resultados</h2></div><span className="card-chip">Hoy</span></div><div className="donut" aria-label="4 apuestas ganadas y 2 perdidas"><span>67%<small>acierto</small></span></div><div className="legend"><span><i className="win-dot" />Ganadas <strong>4</strong></span><span><i className="loss-dot" />Perdidas <strong>2</strong></span></div></article>
          <article className="chart-card wins-card"><div className="card-heading"><div><p className="card-label">Carreras</p><h2>Victorias por caracol</h2></div><span className="card-chip">6 en total</span></div><div className="bar-chart" aria-label="Gráfica de victorias por caracol">{snailWins.map((snail) => <div className="bar-column" key={snail.name}><span className="bar-value">{snail.wins}</span><div className="bar-track"><i style={{ height: `${snail.wins * 42}%`, background: snail.color }} /></div><span>{snail.name}</span></div>)}</div></article>
        </section>
        <section className="payment-section" id="recarga"><div className="payment-copy"><p className="eyebrow">SnailPay</p><h2>Recarga tu saldo</h2><p>Esta pasarela es una simulación. No ingreses información financiera real.</p><dl><dt>Datos aprobados</dt><dd>1234123412341234 · 12/26 · CVV 543</dd><dt>Fondos insuficientes</dt><dd>Monto mayor a $500.00</dd><dt>Servicio no disponible</dt><dd>0000000000000000</dd></dl></div>
          <form className="payment-form" onSubmit={submitCharge}><label>Número de tarjeta<input name="cardNumber" inputMode="numeric" maxLength={16} placeholder="1234123412341234" required /></label><div className="form-pair"><label>Vencimiento<input name="expirationDate" placeholder="MM/AA" maxLength={5} required /></label><label>CVV<input name="cvv" inputMode="numeric" maxLength={4} required /></label></div><label>Nombre completo<input name="cardholderName" defaultValue={user.fullName} required /></label><label>Monto a recargar<input name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" required /></label><button className="primary-button" disabled={isCharging}>{isCharging ? 'Conectando...' : 'Recargar saldo'}</button>{paymentError && <p className="form-message error" role="alert">{paymentError}</p>}{payment && <p className={`form-message ${payment.status === 'approved' ? 'success' : 'error'}`} role="status">{getPaymentMessage(payment)}</p>}</form>
        </section>
      </section>
    </main>
  );
}

export function App() {
  const auth = useAuth();
  if (!auth.isReady) return <div className="loading-screen">Preparando pista...</div>;
  return auth.user ? <Dashboard user={auth.user} onLogout={auth.logout} onBalanceUpdated={auth.updateBalance} /> : <AuthScreen onLogin={auth.login} onRegister={auth.register} />;
}

export default App;
