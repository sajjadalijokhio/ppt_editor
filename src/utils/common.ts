import { padStart } from 'lodash'

/**
 * Fill in the number of digits
 * @param digit The number
 * @param len The length of digits
 */
export const fillDigit = (digit: number, len: number) => {
  return padStart('' + digit, len, '0')
}

/**
 * Determine the device
 */
export const isPC = () => {
  return !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|Mobile|BlackBerry|Symbian|Windows Phone)/i)
}
