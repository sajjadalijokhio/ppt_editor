import CryptoJS from 'crypto-js'

const CRYPTO_KEY = 'pptist'

/**
 * Encrypt
 * @param msg The string to be encrypted
 */
export const encrypt = (msg: string) => {
  return CryptoJS.AES.encrypt(msg, CRYPTO_KEY).toString()
}

/**
 * Decrypt
 * @param ciphertext The string to be decrypted
 */
export const decrypt = (ciphertext: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, CRYPTO_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
