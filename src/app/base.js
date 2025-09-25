// src/app/base.js:

"use strict";

const {
  envMode,
  isDebug,
  isDevelopment,
  isProduction,
  isTesting,
} = require("../lib/environment");

const Strings = require("../lib/strings");
const Errors = require("./errors");

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
 * - Error class access (custom error types)
 */
class Base {
  #logger;

  constructor() {
    this.#logger = console;
  }

  // ─────────────────────────────────────────────────────────────
  // Error Class Getters
  // ─────────────────────────────────────────────────────────────

  /** @returns {typeof Errors.ApplicationError} */
  get ApplicationError() {
    return Errors.ApplicationError;
  }

  /** @returns {typeof Errors.DatabaseError} */
  get DatabaseError() {
    return Errors.DatabaseError;
  }

  /** @returns {typeof Errors.NotFoundError} */
  get NotFoundError() {
    return Errors.NotFoundError;
  }

  /** @returns {typeof Errors.NotImplementedError} */
  get NotImplementedError() {
    return Errors.NotImplementedError;
  }

  /** @returns {typeof Errors.ValidationError} */
  get ValidationError() {
    return Errors.ValidationError;
  }

  // ─────────────────────────────────────────────────────────────
  // Assertion / Error Handling
  // ─────────────────────────────────────────────────────────────

  assert(condition, message = "Assertion failed", values = undefined) {
    if (!condition) {
      this.throwError(message, values);
    }
  }

  notImplemented(methodName) {
    if (typeof methodName !== "string" || methodName.trim() === "") {
      methodName = "<unknownMethod>";
    }

    const msg = `${this.className}.${methodName} is not implemented`;
    this.logger.error(msg);

    throw new this.NotImplementedError(this.className, methodName);
  }

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

  // ─────────────────────────────────────────────────────────────
  // Class Info / Meta
  // ─────────────────────────────────────────────────────────────

  get className() {
    return this.constructor?.name || "<UnknownClass>";
  }

  toJSON() {
    return {
      class: this.className,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Environment Getters
  // ─────────────────────────────────────────────────────────────

  get envMode() {
    return envMode;
  }

  get isDebug() {
    return isDebug;
  }

  get isDevelopment() {
    return isDevelopment;
  }

  get isProduction() {
    return isProduction;
  }

  get isTesting() {
    return isTesting;
  }

  // ─────────────────────────────────────────────────────────────
  // Logger Access
  // ─────────────────────────────────────────────────────────────

  get logger() {
    return this.#logger;
  }

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

  // ─────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────

  async initialize() {
    // Override in subclass if needed
  }
}

module.exports = Base;
