// base.js:

"use strict";

/**
 * Base class providing environment helpers, logging,
 * and standardized error throwing logic for derived classes.
 */

// load all necessary modules
const {
  envMode,
  isDebug,
  isDevelopment,
  isProduction,
  isTesting,
} = require("../lib/environment");
const Strings = require("../lib/strings");
const Errors = require("./errors");

class Base {
  #logger;

  /**
   * Constructs a new Base instance and sets up logger and error bindings.
   */
  constructor() {
    this.#logger = console;
    this.#bindCustomErrorThrowers();
  }

  /**
   * Returns the class name of the instance.
   * @returns {string}
   */
  get className() {
    return this.constructor?.name || "<UnknownClass>";
  }

  /**
   * Returns the current environment mode (e.g., "development", "production").
   * @returns {string}
   */
  get envMode() {
    return envMode;
  }

  /**
   * Returns true if the environment is in debug mode.
   * @returns {boolean}
   */
  get isDebug() {
    return isDebug;
  }

  /**
   * Returns true if the environment is development.
   * @returns {boolean}
   */
  get isDevelopment() {
    return isDevelopment;
  }

  /**
   * Returns true if the environment is production.
   * @returns {boolean}
   */
  get isProduction() {
    return isProduction;
  }

  /**
   * Returns true if the environment is testing.
   * @returns {boolean}
   */
  get isTesting() {
    return isTesting;
  }

  /**
   * Gets the current logger instance.
   * @returns {object}
   */
  get logger() {
    return this.#logger;
  }

  /**
   * Sets a custom logger. Must implement standard logging methods.
   * Falls back to console if null/undefined is passed.
   *
   * @param {object} value - A logger object with `error`, `warn`, `info`, `debug`, `trace` methods.
   * @throws {Errors.TypeError} If value is not a valid logger object.
   */
  set logger(value) {
    if (value === null || value === undefined) {
      value = console;
    }

    if (typeof value !== "object") {
      throw new Errors.TypeError(
        500,
        `${this.className}.logger: Expected object, got ${typeof value}`,
        {
          expected: "object",
          received: typeof value,
        }
      );
    }

    const required = ["error", "warn", "info", "debug", "trace"];
    for (const method of required) {
      if (typeof value[method] !== "function") {
        throw new Errors.TypeError(
          500,
          `${this.className}.logger is missing method "${method}"`,
          {
            method,
            expected: "function",
            received: typeof value[method],
          }
        );
      }
    }

    this.#logger = value;
  }

  /**
   * Returns a JSON representation of the instance.
   * @returns {{ class: string }}
   */
  toJSON() {
    return {
      class: this.className,
    };
  }

  /**
   * Optional asynchronous initialization hook.
   * Meant to be overridden by subclasses if needed.
   * @returns {Promise<void>}
   */
  async initialize() {
    // Optional override
  }

  /**
   * Asserts that a condition is true, otherwise throws an error.
   *
   * @param {boolean} condition - Condition to assert.
   * @param {string} [message="Assertion failed"] - Error message if assertion fails.
   * @param {object} [payload={}] - Additional error context.
   * @throws {Error}
   */
  assert(condition, message = "Assertion failed", payload = {}) {
    if (!condition) {
      this.throwError(500, message, payload);
    }
  }

  /**
   * Throws a standardized "Not Implemented" error for abstract methods.
   *
   * @param {string} methodName - Name of the unimplemented method.
   * @throws {Errors.NotImplementedError}
   */
  notImplemented(methodName) {
    if (typeof methodName !== "string" || methodName.trim() === "") {
      methodName = "<unknownMethod>";
    }

    const message = `${this.className}.${methodName} is not implemented`;
    this.throwNotImplementedError(501, message, {
      class: this.className,
      method: methodName,
    });
  }

  /**
   * Generic error thrower used by subclasses.
   *
   * @param {number} [status=500] - HTTP status code.
   * @param {string} [message="Internal Error"] - Error message.
   * @param {object} [payload={}] - Additional error context.
   * @throws {Error}
   */
  throwError(status = 500, message = "Internal Error", payload = {}) {
    this.#prepareAndThrowError(
      Error,
      status,
      message,
      payload,
      this.throwError
    );
  }

  /**
   * Internal method that prepares and throws an error of the given class.
   *
   * @private
   * @param {Function} ErrorClass - Error class to instantiate.
   * @param {number} status - HTTP status code.
   * @param {string} message - Error message, optionally templated.
   * @param {object} [payload={}] - Payload used in templating and logging.
   * @param {Function} traceFn - Function to use for stack trace capture.
   * @throws {Error}
   */
  #prepareAndThrowError(ErrorClass, status, message, payload = {}, traceFn) {
    let finalMsg = message;

    if (payload && typeof payload === "object") {
      try {
        finalMsg = Strings.expand(message, payload);
      } catch (expandErr) {
        this.logger.error(
          `Error expanding message template: ${expandErr.message}`,
          {
            message,
            payload,
          }
        );
        finalMsg = message;
      }
    }

    if (this.isProduction) {
      this.logger.error(finalMsg);
    } else {
      this.logger.error(finalMsg, { status, payload });
    }

    const err = new ErrorClass(status, finalMsg, payload);
    err.className = this.className;

    if (Error.captureStackTrace && typeof traceFn === "function") {
      Error.captureStackTrace(err, traceFn);
    }

    throw err;
  }

  /**
   * Dynamically generates `throwXError()` methods for all custom error classes.
   *
   * @private
   */
  #bindCustomErrorThrowers() {
    const excluded = new Set(["BaseError"]);

    for (const [key, ErrorClass] of Object.entries(Errors)) {
      if (!key.endsWith("Error") || excluded.has(key)) continue;

      const methodName = `throw${key}`;
      if (typeof this[methodName] === "function") continue;

      this[methodName] = (status, message, payload = {}) => {
        this.#prepareAndThrowError(
          ErrorClass,
          status,
          message,
          payload,
          this[methodName]
        );
      };
    }
  }
}

module.exports = Base;
