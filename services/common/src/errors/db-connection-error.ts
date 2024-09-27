import { CustomError } from './custom-error'

export class DBConnectionError extends CustomError {
  statusCode = 500
  constructor() {
    super('Error connection to DB')

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, DBConnectionError.prototype)
  }

  serializeErrors() {
    return { errors: [{ message: 'Error connection to DB' }] }
  }
}
