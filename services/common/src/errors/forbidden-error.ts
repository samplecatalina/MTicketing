import { CustomError } from './custom-error'

export class ForbiddenError extends CustomError {
  statusCode = 403

  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }

  serializeErrors() {
    return { errors: [{ message: this.message }] }
  }
}
