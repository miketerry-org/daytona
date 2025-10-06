// env.js:

"use strict";

// always try to load any .env file
require("dotenv").config();

/**
 * Custom error thrown when environment validation fails.
 * @class
 */
class EnvError extends Error {
  constructor(message) {
    super(message);
    this.name = "EnvError";
  }
}

/**
 * Parses and validates runtime environment configuration.
 * @class
 */
class Environment {
  #mode;
  #encryptKey;

  /**
   * Valid aliases for environment modes.
   * @type {Object<string, string[]>}
   */
  static VALID_MODES = {
    production: ["prod", "production"],
    development: ["dev", "development"],
    debugging: ["debug", "debugging"],
    testing: ["test", "testing"],
  };

  /**
   * Creates and validates a new Environment instance.
   * @throws {EnvError} If required environment variables are missing or invalid.
   */
  constructor() {
    let mode = process.env.NODE_ENV;

    if (typeof mode !== "string" || mode.trim() === "") {
      mode = "production";
    }

    mode = mode.trim().toLowerCase();
    if (!this.#isValidMode(mode)) {
      throw new EnvError(
        `Invalid NODE_ENV value: "${mode}". Must be one of: ${this.#allValidModes().join(
          ", "
        )}`
      );
    }

    this.#mode = mode;

    const key = process.env.ENCRYPT_KEY;
    if (!key) {
      throw new EnvError(`The "ENCRYPT_KEY" environment variable is missing.`);
    } else if (key.trim().length !== 64) {
      throw new EnvError(
        `The "ENCRYPT_KEY" environment variable must have a length of 64.`
      );
    }

    this.#encryptKey = key;
  }

  // ──────────────────────── Private Methods ────────────────────────

  #isValidMode(mode) {
    return this.#allValidModes().includes(mode);
  }

  #allValidModes() {
    return Object.values(Environment.VALID_MODES).flat();
  }

  // ───────────────────────── Getters ─────────────────────────

  /**
   * The raw environment mode string (e.g., "production").
   * @returns {string}
   */
  get mode() {
    return this.#mode;
  }

  /**
   * True if current mode is production.
   * @returns {boolean}
   */
  get production() {
    return Environment.VALID_MODES.production.includes(this.#mode);
  }

  /**
   * True if current mode is development.
   * @returns {boolean}
   */
  get development() {
    return Environment.VALID_MODES.development.includes(this.#mode);
  }

  /**
   * True if current mode is debugging.
   * @returns {boolean}
   */
  get debugging() {
    return Environment.VALID_MODES.debugging.includes(this.#mode);
  }

  /**
   * True if current mode is testing.
   * @returns {boolean}
   */
  get testing() {
    return Environment.VALID_MODES.testing.includes(this.#mode);
  }

  /**
   * The encryption key used by the system (length: 64).
   * @returns {string}
   */
  get encryptKey() {
    return this.#encryptKey;
  }
}

// ──────────────────────── Singleton Logic ────────────────────────

/**
 * Cached singleton instance of the Environment.
 * @type {Environment | undefined}
 */
let _env = undefined;

/**
 * Cached error from a failed initialization attempt.
 * @type {EnvError | undefined}
 */
let _envError = undefined;

/**
 * Flag to track whether the environment has been logged.
 * @type {boolean}
 */
let _envInitializedLogged = false;

/**
 * Module exports.
 */
module.exports = {
  /**
   * The Environment class (can be used to create manual instances).
   */
  Environment,

  /**
   * The EnvError class (used for throwing environment-specific errors).
   */
  EnvError,

  /**
   * Lazily initialized, validated singleton Environment instance.
   * Throws an EnvError if initialization fails.
   * @returns {Environment}
   */
  get env() {
    if (_env) {
      return _env;
    }

    // if previous error then rethrow it
    if (_envError) {
      throw _envError;
    }

    try {
      _env = new Environment();

      // if first time, then log to console
      if (!_envInitializedLogged) {
        _envInitializedLogged = true;
        console.log("Environment initialized:");
        console.log("  mode:", _env.mode);
        console.log("  production:", _env.production);
        console.log("  development:", _env.development);
        console.log("  debugging:", _env.debugging);
        console.log("  testing:", _env.testing);
        console.log("  encryptKey:", _env.encryptKey);
      }

      return _env;
    } catch (err) {
      _envError = err;
      throw err;
    }
  },

  /**
   * Clears the cached singleton and any stored error.
   * This is useful for testing or reloading the configuration.
   * @example
   *   const { _clearEnvSingleton } = require('./env');
   *   _clearEnvSingleton();
   */
  _clearEnvSingleton() {
    _env = undefined;
    _envError = undefined;
    _envInitializedLogged = false;
  },
};
