// config.js

"use strict";

const fs = require("fs");
const path = require("path");
const { isProduction } = require("../lib/environment");
const Base = require("./base");

/**
 * Absolute path to the local encryption key file (used only in development).
 * @type {string}
 */
const keyFilePath = path.resolve(process.cwd(), "_encrypt.key");

// ❌ Prevent use of local key file in production
if (isProduction && fs.existsSync(keyFilePath)) {
  console.error(
    `[SECURITY] Detected "_encrypt.key" file in production environment! This should never happen.`
  );
  process.exit(1);
}

// 🔐 Load ENCRYPT_KEY from file in non-production environments
if (!isProduction) {
  try {
    const key = fs.readFileSync(keyFilePath, "utf8").trim();
    process.env.ENCRYPT_KEY = key;
    console.log(`ENCRYPT_KEY loaded from file: ${keyFilePath}`);
  } catch (err) {
    console.error(`Failed to load ENCRYPT_KEY from ${keyFilePath}`);
    console.error(err.message);
    process.exit(1);
  }
}

// Final validation for ENCRYPT_KEY in all environments
if (!process.env.ENCRYPT_KEY || process.env.ENCRYPT_KEY.length !== 64) {
  console.error(
    `The "ENCRYPT_KEY" environment variable is missing or not exactly 64 characters!`
  );
  process.exit(1);
}

/**
 * Config class for managing sensitive configuration such as encryption keys.
 * Inherits logging and error utilities from Base.
 */
class Config extends Base {
  /**
   * Returns the encryption key from environment.
   * @returns {string}
   */
  get encryptKey() {
    return process.env.ENCRYPT_KEY;
  }

  /**
   * Load configuration from a file (not yet implemented).
   * @param {string} filename - Path to configuration file.
   */
  loadFromFile(filename) {
    this.notImplemented("loadFromFile");
  }
}

module.exports = Config;
