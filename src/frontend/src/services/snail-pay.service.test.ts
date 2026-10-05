import { afterEach, describe, expect, it, vi } from 'vitest'
import { chargeWithSnailPay } from './snail-pay.service'

const request = {
  cardNumber: '1234123412341234',
  expirationDate: '12/26',
  cvv: '543',
  cardholderName: 'Ada Lovelace',
  amount: 25,
  payerId: 'user-1',
  payerEmail: 'ada@example.com'
}

const approvedResponse = {
  id: 'payment-1',
  status: 'approved' as const,
  status_detail: 'accredited',
  transaction_amount: 25,
  date_created: '2026-10-04T00:00:00.000Z',
  authorization_code: 'AUTH-123',
  reference: 'SNP-123',
  payer_id: request.payerId,
  payer_email: request.payerEmail,
  card_number: request.cardNumber,
  cvv: request.cvv
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('chargeWithSnailPay', () => {
  it('envía el contrato de cobro y devuelve una operación aprobada', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => approvedResponse })
    vi.stubGlobal('fetch', fetchMock)

    await expect(chargeWithSnailPay(request)).resolves.toEqual(approvedResponse)
    expect(fetchMock).toHaveBeenCalledWith('/api/snailpay/charges', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(request)
    }))
  })

  it('devuelve la respuesta rechazada para que la interfaz no acredite saldo', async () => {
    const rejectedResponse = { ...approvedResponse, status: 'rejected' as const, status_detail: 'insufficient_funds', authorization_code: null }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => rejectedResponse }))

    await expect(chargeWithSnailPay(request)).resolves.toEqual(rejectedResponse)
  })

  it('devuelve el error interno simulado para que la interfaz no acredite saldo', async () => {
    const systemErrorResponse = { ...approvedResponse, status: 'error' as const, status_detail: 'system_unavailable', authorization_code: null }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => systemErrorResponse }))

    await expect(chargeWithSnailPay(request)).resolves.toEqual(systemErrorResponse)
  })

  it('muestra un error comprensible ante un problema de red', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))

    await expect(chargeWithSnailPay(request)).rejects.toThrow('No fue posible conectar con SnailPay.')
  })

  it('muestra un error de timeout cuando la solicitud es abortada', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')))

    await expect(chargeWithSnailPay(request)).rejects.toThrow('SnailPay tardó demasiado en responder. Intenta nuevamente.')
  })
})