// env.js:

"use strict";

require("dotenv").config();

class Environment {
  #mode;
  #encryptKey;

  static VALID_MODES = {
    production: ["prod", "production"],
    development: ["dev", "development"],
    debugging: ["debug", "debugging"],
    testing: ["test", "testing"],
  };

  constructor() {
    // try to get the node environment from the computers process environment variables
    let mode = process.env.NODE_ENV;

    // Default to "production" if undefined or invalid
    if (typeof mode !== "string" || mode.trim() === "") {
      mode = "production";
    }

    // perform cleanup of environment mode value
    mode = mode.trim().toLowerCase();
    this.#mode = mode;

    // Validate mode against known values
    if (!this.#isValidMode(mode)) {
      throw new Error(
        `Invalid NODE_ENV value: "${mode}". Must be one of: ${this.#allValidModes().join(
          ", "
        )}`
      );
    }

    // attempt to get the encryption key from process.env
    const key = process.env.ENCRYPT_KEY;
    if (!key) {
      throw new Error(`The "ENCRYPT_KEY" environment variable is missing!`);
    } else if (key.trim().length !== 64) {
      throw new Error(
        `The "ENCRYPT_KEY" environment variable must have a length of 64.`
      );
    } else {
      // rember the encryption key
      this.#encryptKey = key;
    }
  }

  #isValidMode(mode) {
    return this.#allValidModes().includes(mode);
  }

  #allValidModes() {
    return Object.values(Environment.VALID_MODES).flat();
  }

  get mode() {
    return this.#mode;
  }

  get production() {
    return Environment.VALID_MODES.production.includes(this.#mode);
  }

  get development() {
    return Environment.VALID_MODES.development.includes(this.#mode);
  }

  get debugging() {
    return Environment.VALID_MODES.debugging.includes(this.#mode);
  }

  get testing() {
    return Environment.VALID_MODES.testing.includes(this.#mode);
  }

  get encryptKey() {
    return this.#encryptKey;
  }
}

// Initialize and export singleton
let env;

try {
  env = new Environment();
} catch (err) {
  // Re-throw so calling module can catch it if needed
  throw err;
}

console.log("mode:", env.mode);
console.log("production:", env.production);
console.log("development:", env.development);
console.log("debugging:", env.debugging);
console.log("testing:", env.testing);
console.log("encryptKey", env.encryptKey);

module.exports = env;
