// base.js:

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

class Base {
  #logger;

  constructor() {
    this.#logger = console;
    this.#bindCustomErrorThrowers();
  }

  get className() {
    return this.constructor?.name || "<UnknownClass>";
  }

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

  get logger() {
    return this.#logger;
  }

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

  toJSON() {
    return {
      class: this.className,
    };
  }

  async initialize() {
    // Optional override
  }

  assert(condition, message = "Assertion failed", payload = {}) {
    if (!condition) {
      this.throwError(500, message, payload);
    }
  }

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
   * Fallback generic error thrower
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
   * Prepares and throws an error of the given type with full logging and optional templating
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
   * Dynamically generates throwXError methods for each custom error class
   */
  #bindCustomErrorThrowers() {
    const excluded = new Set(["BaseError"]);

    for (const [key, ErrorClass] of Object.entries(Errors)) {
      if (!key.endsWith("Error") || excluded.has(key)) continue;

      const methodName = `throw${key}`;
      if (typeof this[methodName] === "function") continue; // Don't overwrite

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
