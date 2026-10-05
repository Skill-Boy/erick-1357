const chargeExample = {
  cardNumber: '1234123412341234',
  expirationDate: '12/26',
  cvv: '543',
  cardholderName: 'Ada Lovelace',
  amount: 120,
  payerId: 'f31e7c71-403f-4d4f-8fce-3c2e6c99f02c',
  payerEmail: 'ada@example.com'
}

const approvedResponse = {
  id: '994d49c1-7d44-4cdf-a680-9e2d8b807bb1',
  status: 'approved',
  status_detail: 'accredited',
  transaction_amount: 120,
  date_created: '2026-10-04T16:00:00.000Z',
  authorization_code: 'AUTH-994d49c1',
  reference: 'SNP-994D49C1',
  payer_id: chargeExample.payerId,
  payer_email: chargeExample.payerEmail,
  card_number: chargeExample.cardNumber,
  cvv: chargeExample.cvv
}

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'SnailPay API',
    version: '1.0.0',
    description: 'Pasarela simulada para recargas. Solo acepta datos ficticios; no procesa pagos reales.'
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
  paths: {
    '/api/snailpay/charges': {
      post: {
        summary: 'Procesa una recarga simulada',
        description: 'Aprobación: tarjeta 1234123412341234, vencimiento 12/26, CVV 543, titular no vacío y monto entre 0.01 y 500. Error de sistema: tarjeta 0000000000000000.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChargeRequest' },
              examples: { successfulCharge: { summary: 'Cobro aprobado', value: chargeExample } }
            }
          }
        },
        responses: {
          '201': {
            description: 'Cobro aprobado. El cliente puede acreditar el saldo.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentResponse' }, examples: { approved: { value: approvedResponse } } } }
          },
          '422': {
            description: 'Transacción rechazada. El cliente no debe modificar el saldo.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaymentResponse' },
                examples: {
                  insufficientFunds: { summary: 'Saldo insuficiente', value: { ...approvedResponse, status: 'rejected', status_detail: 'insufficient_funds', transaction_amount: 500.01, authorization_code: null } },
                  invalidCard: { summary: 'Tarjeta rechazada', value: { ...approvedResponse, status: 'rejected', status_detail: 'card_declined', card_number: '9999999999999999', authorization_code: null } }
                }
              }
            }
          },
          '503': {
            description: 'Error interno simulado. El cliente no debe modificar el saldo.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentResponse' }, examples: { systemUnavailable: { value: { ...approvedResponse, status: 'error', status_detail: 'system_unavailable', card_number: '0000000000000000', authorization_code: null } } } } }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      ChargeRequest: {
        type: 'object',
        required: ['cardNumber', 'expirationDate', 'cvv', 'cardholderName', 'amount', 'payerId', 'payerEmail'],
        properties: {
          cardNumber: { type: 'string', example: chargeExample.cardNumber },
          expirationDate: { type: 'string', example: chargeExample.expirationDate },
          cvv: { type: 'string', example: chargeExample.cvv },
          cardholderName: { type: 'string', example: chargeExample.cardholderName },
          amount: { type: 'number', minimum: 0.01, example: chargeExample.amount },
          payerId: { type: 'string', example: chargeExample.payerId },
          payerEmail: { type: 'string', format: 'email', example: chargeExample.payerEmail }
        }
      },
      PaymentResponse: {
        type: 'object',
        required: ['id', 'status', 'status_detail', 'transaction_amount', 'date_created', 'authorization_code', 'reference', 'payer_id', 'payer_email', 'card_number', 'cvv'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['approved', 'rejected', 'error'] },
          status_detail: { type: 'string', example: 'accredited' },
          transaction_amount: { type: 'number' },
          date_created: { type: 'string', format: 'date-time' },
          authorization_code: { type: 'string', nullable: true },
          reference: { type: 'string' },
          payer_id: { type: 'string' },
          payer_email: { type: 'string', format: 'email' },
          card_number: { type: 'string' },
          cvv: { type: 'string' }
        }
      }
    }
  }
}