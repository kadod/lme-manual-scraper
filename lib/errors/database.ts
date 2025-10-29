export enum DatabaseErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  UNKNOWN = 'UNKNOWN',
}

export class DatabaseError extends Error {
  code: DatabaseErrorCode
  details?: unknown

  constructor(
    message: string,
    code: DatabaseErrorCode = DatabaseErrorCode.UNKNOWN,
    details?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
    this.details = details
    Object.setPrototypeOf(this, DatabaseError.prototype)
  }

  static notFound(resource: string, id?: string): DatabaseError {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`
    return new DatabaseError(message, DatabaseErrorCode.NOT_FOUND)
  }

  static alreadyExists(resource: string, identifier?: string): DatabaseError {
    const message = identifier
      ? `${resource} with ${identifier} already exists`
      : `${resource} already exists`
    return new DatabaseError(message, DatabaseErrorCode.ALREADY_EXISTS)
  }

  static invalidInput(message: string): DatabaseError {
    return new DatabaseError(message, DatabaseErrorCode.INVALID_INPUT)
  }

  static unauthorized(message: string = 'Unauthorized access'): DatabaseError {
    return new DatabaseError(message, DatabaseErrorCode.UNAUTHORIZED)
  }

  static constraintViolation(message: string): DatabaseError {
    return new DatabaseError(message, DatabaseErrorCode.CONSTRAINT_VIOLATION)
  }
}

export type DatabaseResult<T> =
  | { success: true; data: T }
  | { success: false; error: DatabaseError }

export function handleDatabaseError(error: unknown): DatabaseError {
  if (error instanceof DatabaseError) {
    return error
  }

  if (error instanceof Error) {
    return new DatabaseError(error.message, DatabaseErrorCode.UNKNOWN, error)
  }

  return new DatabaseError(
    'An unknown database error occurred',
    DatabaseErrorCode.UNKNOWN,
    error
  )
}
