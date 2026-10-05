import { FormEvent, useState } from 'react'

interface AuthResult {
  ok: boolean;
  message: string;
}

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<AuthResult>;
  onRegister: (name: string, email: string, password: string, confirmation: string) => Promise<AuthResult>;
}

export function AuthScreen({ onLogin, onRegister }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setIsSubmitting(true)
    const result = mode === 'login'
      ? await onLogin(String(data.get('email')), String(data.get('password')))
      : await onRegister(
        String(data.get('fullName')),
        String(data.get('email')),
        String(data.get('password')),
        String(data.get('confirmation'))
      )
    setIsSubmitting(false)
    setMessage(result.message)
  }

  return (
    <main className="auth-page">
      <div className="auth-background-mark" aria-hidden="true"><span /></div>
      <section className="auth-panel" aria-label="Acceso a la cuenta">
        <div className="auth-brand"><span className="brand-mark">S</span><strong>SnailCircuit</strong></div>
        <div className="tab-row" role="tablist" aria-label="Modo de acceso">
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => { setMode('register'); setMessage('') }}>Crear cuenta</button>
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); setMessage('') }}>Ingresar</button>
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
  )
}