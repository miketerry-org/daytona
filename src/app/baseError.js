// baseError.js:

"use strict";

/**
 * BaseError extends the native Error and adds HTTP status support.
 */
class BaseError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ValidationError extends BaseError {
  constructor(message = "Validation failed", details = {}) {
    super(message, 400);
    this.details = details;
  }
}

class AuthenticationError extends BaseError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

class AuthorizationError extends BaseError {
  constructor(message = "Access denied") {
    super(message, 403);
  }
}

class NotFoundError extends BaseError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

class DatabaseError extends BaseError {
  constructor(message = "Database error", cause = null) {
    super(message, 500);
    this.cause = cause;
  }
}

/**
 * Error representing an unimplemented method in a class.
 */
class NotImplementedError extends BaseError {
  /**
   * @param {string} className - Name of the class
   * @param {string} methodName - Name of the method expected to be overridden
   */
  constructor(className, methodName) {
    const message = `${className}.${methodName} is not implemented`;
    super(message, 501);
  }
}

module.exports = {
  BaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  NotImplementedError,
};
