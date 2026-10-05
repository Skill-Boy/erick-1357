import { randomUUID } from 'crypto'
import '../config/environment'
import { ChargeRequest, PaymentResponse, PaymentStatus } from '../types/payment.types'

const SUCCESS_CARD = process.env.SUCCESS_CARD || '1234123412341234'
const SYSTEM_ERROR_CARD = process.env.SYSTEM_ERROR_CARD || '0000000000000000'
const EXPIRATION_DATE_CARD = process.env.EXPIRATION_DATE_CARD || '12/26'
const CVV_DATE = process.env.CVV_DATE || '543'
const configuredAvailableBalance = Number(process.env.SUCCESS_CARD_AVAILABLE_BALANCE)
const SUCCESS_CARD_AVAILABLE_BALANCE = Number.isFinite(configuredAvailableBalance) && configuredAvailableBalance > 0
  ? configuredAvailableBalance
  : 500

export class SnailPayService {
  public charge(request: ChargeRequest): PaymentResponse {
    if (request.cardNumber === SYSTEM_ERROR_CARD) {
      return this.createResponse(request, 'error', 'system_unavailable', null)
    }

    const hasValidPaymentDetails =
      request.cardNumber === SUCCESS_CARD &&
      request.expirationDate === EXPIRATION_DATE_CARD &&
      request.cvv === CVV_DATE &&
      request.cardholderName.trim().length > 0 &&
      Number.isFinite(request.amount) &&
      request.amount > 0

    if (hasValidPaymentDetails && request.amount > SUCCESS_CARD_AVAILABLE_BALANCE) {
      return this.createResponse(request, 'rejected', 'insufficient_funds', null)
    }

    if (hasValidPaymentDetails) {
      return this.createResponse(request, 'approved', 'accredited', `AUTH-${randomUUID().slice(0, 8)}`)
    }

    return this.createResponse(request, 'rejected', this.getRejectionDetail(request), null)
  }

  private getRejectionDetail(request: ChargeRequest): string {
    if (!Number.isFinite(request.amount) || request.amount <= 0) return 'invalid_amount'
    if (!request.cardholderName.trim()) return 'invalid_cardholder'
    if (request.cardNumber !== SUCCESS_CARD) return 'card_declined'
    if (request.expirationDate !== EXPIRATION_DATE_CARD) return 'invalid_expiration_date'
    return 'invalid_security_code'
  }

  private createResponse(
    request: ChargeRequest,
    status: PaymentStatus,
    statusDetail: string,
    authorizationCode: string | null
  ): PaymentResponse {
    const operationId = randomUUID()
    return {
      id: operationId,
      status,
      status_detail: statusDetail,
      transaction_amount: request.amount,
      date_created: new Date().toISOString(),
      authorization_code: authorizationCode,
      reference: `SNP-${operationId.slice(0, 8).toUpperCase()}`,
      payer_id: request.payerId,
      payer_email: request.payerEmail,
      card_number: request.cardNumber,
      cvv: request.cvv
    }
  }
}

export const snailPayService = new SnailPayService()