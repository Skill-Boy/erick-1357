import { PaymentRequest, PaymentResponse } from '../types/app.types'

export async function chargeWithSnailPay(request: PaymentRequest): Promise<PaymentResponse> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch('/api/snailpay/charges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal
    })
    return (await response.json()) as PaymentResponse
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('SnailPay tardó demasiado en responder. Intenta nuevamente.')
    }
    throw new Error('No fue posible conectar con SnailPay.')
  } finally {
    window.clearTimeout(timeout)
  }
}