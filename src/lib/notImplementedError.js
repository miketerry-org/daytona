// notImplementedError.js:

"use strict";

/**
 * Custom error to represent “method not implemented” situations.
 */
class NotImplementedError extends Error {
  /**
   * @param {string} className - Name of the class
   * @param {string} methodName - Name of the method expected to be overridden
   */
  constructor(className, methodName) {
    const msg = `${className}.${methodName} is not implemented`;
    super(msg);
    this.name = "NotImplementedError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotImplementedError);
    }
  }
}

module.exports = NotImplementedError;
