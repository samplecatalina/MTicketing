import { CustomError } from './custom-error'

export class BadPasswordError extends CustomError {
  statusCode = 401

  constructor() {
    super('Wrong password')
  }
  serializeErrors() {
    return { errors: [{ message: 'Wrong password' }] }
  }
}
