import assert from 'node:assert/strict'
import test from 'node:test'
import { SnailPayService } from './snail-pay.service'

const service = new SnailPayService()
const successCard = process.env.SUCCESS_CARD || '1234123412341234'
const systemErrorCard = process.env.SYSTEM_ERROR_CARD || '0000000000000000'
const expirationDate = process.env.EXPIRATION_DATE_CARD || '12/26'
const cvv = process.env.CVV_DATE || '543'
const configuredBalance = Number(process.env.SUCCESS_CARD_AVAILABLE_BALANCE)
const availableBalance = Number.isFinite(configuredBalance) && configuredBalance > 0 ? configuredBalance : 500
const payer = { payerId: 'user-1', payerEmail: 'user@example.com', cardholderName: 'Usuario de Prueba', amount: 25 }

function validRequest() {
  return { ...payer, cardNumber: successCard, expirationDate, cvv }
}

test('SnailPay aprueba la tarjeta de prueba configurada', () => {
  const payment = service.charge(validRequest())
  assert.equal(payment.status, 'approved')
  assert.equal(payment.status_detail, 'accredited')
  assert.ok(payment.authorization_code)
  assert.equal(payment.transaction_amount, 25)
  assert.equal(payment.payer_email, payer.payerEmail)
  assert.equal(payment.card_number, successCard)
})

test('SnailPay rechaza una tarjeta no configurada', () => {
  const payment = service.charge({ ...validRequest(), cardNumber: '9999999999999999' })
  assert.equal(payment.status, 'rejected')
  assert.equal(payment.status_detail, 'card_declined')
  assert.equal(payment.authorization_code, null)
})

test('SnailPay rechaza por saldo insuficiente sin autorizar el cobro', () => {
  const payment = service.charge({ ...validRequest(), amount: availableBalance + 0.01 })
  assert.equal(payment.status, 'rejected')
  assert.equal(payment.status_detail, 'insufficient_funds')
  assert.equal(payment.authorization_code, null)
})

test('SnailPay informa un error de sistema para la tarjeta de simulación', () => {
  const payment = service.charge({ ...validRequest(), cardNumber: systemErrorCard })
  assert.equal(payment.status, 'error')
  assert.equal(payment.status_detail, 'system_unavailable')
  assert.equal(payment.authorization_code, null)
})

test('SnailPay rechaza montos no positivos', () => {
  const payment = service.charge({ ...validRequest(), amount: 0 })
  assert.equal(payment.status_detail, 'invalid_amount')
})

test('SnailPay rechaza un titular vacío', () => {
  const payment = service.charge({ ...validRequest(), cardholderName: '   ' })
  assert.equal(payment.status_detail, 'invalid_cardholder')
})

test('SnailPay rechaza una fecha de vencimiento distinta a la configurada', () => {
  const payment = service.charge({ ...validRequest(), expirationDate: '01/30' })
  assert.equal(payment.status_detail, 'invalid_expiration_date')
})

test('SnailPay rechaza un CVV distinto al configurado', () => {
  const payment = service.charge({ ...validRequest(), cvv: '000' })
  assert.equal(payment.status_detail, 'invalid_security_code')
})