import { randomUUID } from 'crypto';
import { ChargeRequest, PaymentResponse, PaymentStatus } from '../types/payment.types';

const SUCCESS_CARD = '1234123412341234';
const SYSTEM_ERROR_CARD = '0000000000000000';
const SUCCESS_CARD_AVAILABLE_BALANCE = 500;

export class SnailPayService {
  public charge(request: ChargeRequest): PaymentResponse {
    if (request.cardNumber === SYSTEM_ERROR_CARD) {
      return this.createResponse(request, 'error', 'system_unavailable', null);
    }

    const hasValidPaymentDetails =
      request.cardNumber === SUCCESS_CARD &&
      request.expirationDate === '12/26' &&
      request.cvv === '543' &&
      request.cardholderName.trim().length > 0 &&
      Number.isFinite(request.amount) &&
      request.amount > 0;

    if (hasValidPaymentDetails && request.amount > SUCCESS_CARD_AVAILABLE_BALANCE) {
      return this.createResponse(request, 'rejected', 'insufficient_funds', null);
    }

    if (hasValidPaymentDetails) {
      return this.createResponse(request, 'approved', 'accredited', `AUTH-${randomUUID().slice(0, 8)}`);
    }

    return this.createResponse(request, 'rejected', this.getRejectionDetail(request), null);
  }

  private getRejectionDetail(request: ChargeRequest): string {
    if (!Number.isFinite(request.amount) || request.amount <= 0) return 'invalid_amount';
    if (!request.cardholderName.trim()) return 'invalid_cardholder';
    if (request.cardNumber !== SUCCESS_CARD) return 'card_declined';
    if (request.expirationDate !== '12/26') return 'invalid_expiration_date';
    return 'invalid_security_code';
  }

  private createResponse(
    request: ChargeRequest,
    status: PaymentStatus,
    statusDetail: string,
    authorizationCode: string | null
  ): PaymentResponse {
    const operationId = randomUUID();
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
    };
  }
}

export const snailPayService = new SnailPayService();