import assert from 'node:assert/strict';
import test from 'node:test';
import { SnailPayService } from './snail-pay.service';

const service = new SnailPayService();
const payer = { payerId: 'user-1', payerEmail: 'user@example.com', cardholderName: 'Usuario de Prueba', amount: 25 };

test('SnailPay aprueba la tarjeta de prueba configurada', () => {
  const payment = service.charge({ ...payer, cardNumber: '1234123412341234', expirationDate: '12/26', cvv: '543' });
  assert.equal(payment.status, 'approved');
  assert.equal(payment.status_detail, 'accredited');
  assert.ok(payment.authorization_code);
  assert.equal(payment.transaction_amount, 25);
});

test('SnailPay rechaza una transacción inválida sin autorizarla', () => {
  const payment = service.charge({ ...payer, cardNumber: '9999999999999999', expirationDate: '12/26', cvv: '543' });
  assert.equal(payment.status, 'rejected');
  assert.equal(payment.status_detail, 'card_declined');
  assert.equal(payment.authorization_code, null);
});

test('SnailPay rechaza por saldo insuficiente sin autorizar el cobro', () => {
  const payment = service.charge({ ...payer, amount: 500.01, cardNumber: '1234123412341234', expirationDate: '12/26', cvv: '543' });
  assert.equal(payment.status, 'rejected');
  assert.equal(payment.status_detail, 'insufficient_funds');
  assert.equal(payment.authorization_code, null);
});

test('SnailPay informa un error de sistema para la tarjeta de simulación', () => {
  const payment = service.charge({ ...payer, cardNumber: '0000000000000000', expirationDate: '12/26', cvv: '543' });
  assert.equal(payment.status, 'error');
  assert.equal(payment.status_detail, 'system_unavailable');
  assert.equal(payment.authorization_code, null);
});