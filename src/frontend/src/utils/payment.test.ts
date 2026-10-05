import { describe, expect, it } from 'vitest'
import { formatExpirationDate } from './payment'

describe('formatExpirationDate', () => {
  it('agrega la barra cuando se recibe una fecha de cuatro dígitos', () => {
    expect(formatExpirationDate('1226')).toBe('12/26')
  })

  it('elimina caracteres no numéricos y limita la fecha a cuatro dígitos', () => {
    expect(formatExpirationDate('12-26-99')).toBe('12/26')
  })

  it('conserva una fecha parcial mientras el usuario la escribe', () => {
    expect(formatExpirationDate('1')).toBe('1')
    expect(formatExpirationDate('12')).toBe('12')
  })
})