import crypto from 'crypto'

const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY || '', 'base64')

export function encrypt(plain) {
  if (KEY.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (base64)')
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return { ciphertext: Buffer.concat([enc, tag]).toString('base64'), iv: iv.toString('base64') }
}

export function decrypt(ciphertextB64, ivB64) {
  const buf = Buffer.from(ciphertextB64, 'base64')
  const enc = buf.subarray(0, buf.length - 16)
  const tag = buf.subarray(buf.length - 16)
  const iv = Buffer.from(ivB64, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
}
