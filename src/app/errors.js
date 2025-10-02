// errors.js:

"use strict";

/**
 * BaseError extends the native Error and adds HTTP status and payload support.
 */
class BaseError extends Error {
  /**
   * @param {number} status - HTTP or internal status code
   * @param {string} message - Descriptive error message
   * @param {object} [payload={}] - Additional metadata
   */
  constructor(status = 500, message = "Internal Server Error", payload = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.payload = payload;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ValidationError extends BaseError {
  constructor(status = 400, message = "Validation failed", payload = {}) {
    super(status, message, payload);
  }
}

class AuthenticationError extends BaseError {
  constructor(status = 401, message = "Authentication required", payload = {}) {
    super(status, message, payload);
  }
}

class AuthorizationError extends BaseError {
  constructor(status = 403, message = "Access denied", payload = {}) {
    super(status, message, payload);
  }
}

class NotFoundError extends BaseError {
  constructor(status = 404, message = "Not found", payload = {}) {
    super(status, message, payload);
  }
}

class DatabaseError extends BaseError {
  constructor(status = 500, message = "Database error", payload = {}) {
    super(status, message, payload);
  }
}

class NotImplementedError extends BaseError {
  constructor(status = 501, message = "Not implemented", payload = {}) {
    super(status, message, payload);
  }
}

class TypeError extends BaseError {
  constructor(status = 500, message = "Type error", payload = {}) {
    super(status, message, payload);
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
  TypeError,
};
