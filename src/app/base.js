// base.js:

"use strict";

const {
  envMode,
  isDevelopment,
  isProduction,
  isTesting,
  isDebug,
} = require("../lib/environment");

const Strings = require("../lib/strings");
const NotImplementedError = require("../lib/notImplementedError");

/**
 * Base class providing core utilities for all subclasses:
 * - Customizable logging
 * - Templated error throwing
 * - Not-implemented stubs
 * - Assertion helper
 * - Generic logging wrapper
 * - Class name introspection
 * - Optional initialization hook
 * - JSON serialization hook
 * - Environment mode access
 */
class Base {
  #logger;

  /**
   * Constructs a Base instance with default logger = global console.
   */
  constructor() {
    this.#logger = console;
  }

  /**
   * Get the current logger.
   * @returns {object} A logger with expected methods: error, warn, info, debug, trace.
   */
  get logger() {
    return this.#logger;
  }

  /**
   * Set a custom logger. Falls back to console if null/undefined.
   * @param {object|null|undefined} value
   * @throws {TypeError} If logger is not an object or missing required methods.
   */
  set logger(value) {
    if (value === null || value === undefined) {
      value = console;
    }

    if (typeof value !== "object") {
      throw new TypeError(
        `Logger must be an object, got type '${typeof value}'`
      );
    }

    const required = ["error", "warn", "info", "debug", "trace"];
    for (const method of required) {
      if (typeof value[method] !== "function") {
        throw new TypeError(
          `Logger object is missing required method '${method}'`
        );
      }
    }

    this.#logger = value;
  }

  /**
   * Throw an Error with optional template expansion.
   * Logs the error before throwing.
   * @param {string} message - Message template or literal.
   * @param {Object.<string, *>} [values] - Optional placeholder values.
   * @throws {Error}
   */
  throwError(message, values = undefined) {
    let finalMsg = message;

    if (values && typeof values === "object") {
      try {
        finalMsg = Strings.expand(message, values);
      } catch (expandErr) {
        this.logger.error(
          `Error expanding message template: ${expandErr.message}`,
          { message, values }
        );
        finalMsg = message;
      }
    }

    if (this.isProduction) {
      this.logger.error(finalMsg);
    } else {
      this.logger.error(finalMsg, { values });
    }

    const err = new Error(finalMsg);
    err.values = values;
    err.className = this.className;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, this.throwError);
    }

    throw err;
  }

  /**
   * Indicate a subclass method is not implemented.
   * @param {string} methodName
   * @throws {NotImplementedError}
   */
  notImplemented(methodName) {
    if (typeof methodName !== "string" || methodName.trim() === "") {
      methodName = "<unknownMethod>";
    }

    const msg = `${this.className}.${methodName} is not implemented`;
    this.logger.error(msg);

    throw new NotImplementedError(this.className, methodName);
  }

  /**
   * Assert that a condition is truthy. If not, throws via `throwError`.
   * @param {boolean} condition
   * @param {string} message
   * @param {Object.<string, *>} [values]
   */
  assert(condition, message = "Assertion failed", values = undefined) {
    if (!condition) {
      this.throwError(message, values);
    }
  }

  /**
   * Log a message via specified level, falling back to logger.error.
   * @param {string} level
   * @param {string} message
   * @param {Object.<string, *>} [meta]
   */
  log(level, message, meta = {}) {
    const fn = this.logger[level];
    if (typeof fn === "function") {
      fn.call(this.logger, message, meta);
    } else {
      this.logger.error(
        `Logger missing method '${level}', fallback to error. Message: ${message}`,
        meta
      );
    }
  }

  /**
   * Returns the class name of this instance.
   * @returns {string}
   */
  get className() {
    return this.constructor?.name || "<UnknownClass>";
  }

  /**
   * Optional async initialization hook.
   * @returns {Promise<void>|void}
   */
  async initialize() {
    // Override in subclass if needed
  }

  /**
   * Default JSON representation of the instance.
   * @returns {Object}
   */
  toJSON() {
    return {
      class: this.className,
    };
  }

  // === Environment-related Getters ===

  /**
   * Canonical environment mode (e.g., "development", "production")
   * @returns {string}
   */
  get envMode() {
    return envMode;
  }

  /**
   * True if envMode === "development"
   * @returns {boolean}
   */
  get isDevelopment() {
    return isDevelopment;
  }

  /**
   * True if envMode === "production"
   * @returns {boolean}
   */
  get isProduction() {
    return isProduction;
  }

  /**
   * True if envMode === "test"
   * @returns {boolean}
   */
  get isTesting() {
    return isTesting;
  }

  /**
   * True if envMode === "debug"
   * @returns {boolean}
   */
  get isDebug() {
    return isDebug;
  }
}

module.exports = Base;
