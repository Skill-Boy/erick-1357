import { useEffect, useState } from 'react'
import { localAuthService } from '../services/local-auth.service'
import { User } from '../types/app.types'
import { hashPassword } from '../utils/crypto'

interface AuthResult {
  ok: boolean;
  message: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setUser(localAuthService.getCurrentUser());
    setIsReady(true)
  }, [])

  async function register(fullName: string, email: string, password: string, confirmation: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    if (fullName.trim().length < 3) return { ok: false, message: 'Ingresa tu nombre completo.' }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return { ok: false, message: 'Ingresa un correo electrónico válido.' }
    if (password.length < 8) return { ok: false, message: 'La contraseña debe tener al menos 8 caracteres.' }
    if (password !== confirmation) return { ok: false, message: 'Las contraseñas no coinciden.' }
    if (localAuthService.findUserByEmail(normalizedEmail)) return { ok: false, message: 'Ya existe una cuenta con ese correo.' }

    const newUser: User = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      balance: 0,
      createdAt: new Date().toISOString()
    }
    localAuthService.saveUser(newUser)
    localAuthService.startSession(newUser.id)
    setUser(newUser)
    return { ok: true, message: '' }
  }

  async function login(email: string, password: string): Promise<AuthResult> {
    const foundUser = localAuthService.findUserByEmail(email.trim().toLowerCase())
    if (!foundUser || foundUser.passwordHash !== (await hashPassword(password))) {
      return { ok: false, message: 'Correo o contraseña incorrectos.' }
    }
    localAuthService.startSession(foundUser.id)
    setUser(foundUser)
    return { ok: true, message: '' }
  }

  function updateBalance(amount: number): void {
    if (!user) return
    const updatedUser = { ...user, balance: user.balance + amount }
    localAuthService.saveUser(updatedUser)
    setUser(updatedUser)
  }

  function logout(): void {
    localAuthService.endSession()
    setUser(null)
  }

  return { user, isReady, register, login, updateBalance, logout }
}