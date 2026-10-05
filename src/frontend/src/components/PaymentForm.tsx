import { FormEvent, useState } from 'react'
import { localAuthService } from '../services/local-auth.service'
import { chargeWithSnailPay } from '../services/snail-pay.service'
import { PaymentResponse, User } from '../types/app.types'
import { formatExpirationDate } from '../utils/payment'

interface PaymentFormProps {
  user: User;
  onBalanceUpdated: (amount: number) => void;
}

function getPaymentMessage(payment: PaymentResponse): string {
  if (payment.status === 'approved') return `Recarga aprobada. Referencia: ${payment.reference}`
  if (payment.status_detail === 'insufficient_funds') {
    return 'La tarjeta no tiene fondos suficientes para esta recarga. Tu saldo no cambió.'
  }
  return `Operación no aprobada: ${payment.status_detail.split('_').join(' ')}.`
}

export function PaymentForm({ user, onBalanceUpdated }: PaymentFormProps) {
  const [payment, setPayment] = useState<PaymentResponse | null>(null)
  const [paymentError, setPaymentError] = useState('')
  const [isCharging, setIsCharging] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')

  async function submitCharge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setIsCharging(true)
    setPayment(null)
    setPaymentError('')

    try {
      const response = await chargeWithSnailPay({
        cardNumber: String(data.get('cardNumber')).replace(/\s/g, ''),
        expirationDate: formatExpirationDate(String(data.get('expirationDate'))),
        cvv: String(data.get('cvv')),
        cardholderName: String(data.get('cardholderName')),
        amount: Number(data.get('amount')),
        payerId: user.id,
        payerEmail: user.email
      })
      localAuthService.saveLastPayment(response)
      setPayment(response)
      if (response.status === 'approved') onBalanceUpdated(response.transaction_amount)
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'No se pudo procesar la recarga.')
    } finally {
      setIsCharging(false)
    }
  }

  return (
    <section className="payment-section" id="recarga">
      <div className="payment-copy">
        <p className="eyebrow">SnailPay</p>
        <h2>Recarga tu saldo</h2>
        <p>Esta pasarela es una simulación. No ingreses información financiera real.</p>
        <dl><dt>Datos aprobados</dt><dd>1234123412341234 · 12/26 · CVV 543</dd><dt>Fondos insuficientes</dt><dd>Monto mayor a $500.00</dd><dt>Servicio no disponible</dt><dd>0000000000000000</dd></dl>
      </div>
      <form className="payment-form" onSubmit={submitCharge}>
        <label>Número de tarjeta<input name="cardNumber" inputMode="numeric" maxLength={16} placeholder="1234123412341234" required /></label>
        <div className="form-pair">
          <label>Vencimiento<input name="expirationDate" inputMode="numeric" placeholder="MM/AA" maxLength={5} value={expirationDate} onChange={(event) => setExpirationDate(formatExpirationDate(event.target.value))} required /></label>
          <label>CVV<input name="cvv" inputMode="numeric" maxLength={4} required /></label>
        </div>
        <label>Nombre completo<input name="cardholderName" defaultValue={user.fullName} required /></label>
        <label>Monto a recargar<input name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" required /></label>
        <button className="primary-button" disabled={isCharging}>{isCharging ? 'Conectando...' : 'Recargar saldo'}</button>
        {paymentError && <p className="form-message error" role="alert">{paymentError}</p>}
        {payment && <p className={`form-message ${payment.status === 'approved' ? 'success' : 'error'}`} role="status">{getPaymentMessage(payment)}</p>}
      </form>
    </section>
  )
}