import { describe, expect, it } from 'vitest'
import { decryptString, encryptString, isCipherEnvelope } from './crypto'

describe('crypto', () => {
  it('round-trips a secret', async () => {
    const env = await encryptString('ghp_example_token_1234', 'correct horse battery')
    expect(isCipherEnvelope(env)).toBe(true)
    expect(env.ct).not.toContain('ghp_')
    await expect(decryptString(env, 'correct horse battery')).resolves.toBe(
      'ghp_example_token_1234',
    )
  })

  it('rejects a wrong passphrase', async () => {
    const env = await encryptString('secret', 'right')
    await expect(decryptString(env, 'wrong')).rejects.toThrow()
  })

  it('uses a fresh salt and iv every time', async () => {
    const a = await encryptString('same', 'pass')
    const b = await encryptString('same', 'pass')
    expect(a.salt).not.toBe(b.salt)
    expect(a.iv).not.toBe(b.iv)
    expect(a.ct).not.toBe(b.ct)
  })

  it('validates envelope shapes', () => {
    expect(isCipherEnvelope({ v: 1, salt: 'a', iv: 'b', ct: 'c' })).toBe(true)
    expect(isCipherEnvelope({ v: 2, salt: 'a', iv: 'b', ct: 'c' })).toBe(false)
    expect(isCipherEnvelope(null)).toBe(false)
    expect(isCipherEnvelope('nope')).toBe(false)
  })
})
