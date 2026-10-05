import { PaymentResponse, Session, User } from '../types/app.types';

const USERS_KEY = 'snail-race-users';
const SESSION_KEY = 'snail-race-session';
const LAST_PAYMENT_KEY = 'snail-race-last-payment';

function readUsers(): User[] {
  const value = localStorage.getItem(USERS_KEY);
  return value ? (JSON.parse(value) as User[]) : [];
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const localAuthService = {
  getCurrentUser(): User | null {
    const sessionValue = localStorage.getItem(SESSION_KEY);
    if (!sessionValue) return null;
    const session = JSON.parse(sessionValue) as Session;
    return readUsers().find((user) => user.id === session.userId) ?? null;
  },

  findUserByEmail(email: string): User | null {
    return readUsers().find((user) => user.email === email.toLowerCase()) ?? null;
  },

  saveUser(user: User): void {
    const users = readUsers();
    const existingIndex = users.findIndex((item) => item.id === user.id);
    if (existingIndex >= 0) users[existingIndex] = user;
    else users.push(user);
    saveUsers(users);
  },

  startSession(userId: string): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId } satisfies Session));
  },

  endSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  saveLastPayment(payment: PaymentResponse): void {
    localStorage.setItem(LAST_PAYMENT_KEY, JSON.stringify(payment));
  }
};