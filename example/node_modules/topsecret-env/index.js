// index.js

"use strict";

// Load all necessary modules
const createSchemaTemplate = require("./lib/createschemaTemplate.js");
const TopSecret = require("topsecret");
const decryptEnvFile = require("./lib/decryptEnvFile.js");
const encryptEnvFile = require("./lib/encryptEnvFile.js");
const loadEnvFile = require("./lib/loadEnvFile.js");
const maskSensitiveKeys = require("./lib/maskSensitiveKeys.js");
const validateObject = require("./lib/validateObject.js");

const envTypes = [
  "array",
  "boolean",
  "date",
  "float",
  "integer",
  "object",
  "string",
  "time",
];

/**
 * Class representing a secure environment handler.
 */
class SecretEnv {
  /**
   * Creates a schema template based on the provided object structure.
   * @param {Object} object - The object to derive the schema from.
   * @returns {Object} - Generated schema template.
   */
  static createSchema(object) {
    return createSchemaTemplate(object);
  }

  /**
   * Decrypts an encrypted environment file.
   * @param {string} inputFile - Path to the encrypted input file.
   * @param {string} outputFile - Path to write the decrypted output file.
   * @param {Object} options - Decryption options (e.g., key, algorithm).
   * @returns {void}
   */
  static decryptFile(inputFile, outputFile, options) {
    decryptEnvFile(inputFile, outputFile, options);
    return true;
  }

  /**
   * Encrypts a plain environment file.
   * @param {string} inputFile - Path to the plaintext input file.
   * @param {string} outputFile - Path to write the encrypted output file.
   * @param {Object} options - Encryption options (e.g., key, algorithm).
   * @returns {void}
   */
  static encryptFile(inputFile, outputFile, options) {
    encryptEnvFile(inputFile, outputFile, options);
    return true;
  }

  /**
   * Generates a secure encryption key.
   * @returns {string} - A newly generated encryption key.
   */
  static generateKey() {
    const ts = new TopSecret();
    const key = ts.generateKey();
    return key;
  }

  /**
   * Loads and optionally decrypts an environment file into memory.
   * @param {string} filename - Path to the .env file.
   * @param {string|null} encryptKey - Optional encryption key.
   * @param {Array<Object>} [schema=[]] - Optional validation schema.
   * @returns {Object} - Loaded and optionally validated environment object.
   */
  static loadFromFile(filename, encryptKey = null, schema = []) {
    return loadEnvFile(filename, encryptKey, schema);
  }

  /**
   * Masks specified sensitive keys in an object.
   * @param {Object} object - The object containing sensitive keys.
   * @param {Array<string>} keys - List of keys to mask.
   * @returns {Object} - Object with masked keys.
   */
  static maskKeys(object, keys = []) {
    return maskSensitiveKeys(object, keys);
  }

  /**
   * Returns the list of supported environment variable types.
   * @returns {Array<string>}
   */
  static get types() {
    return envTypes;
  }

  /**
   * Validates an object against a provided schema.
   * @param {Object} object - Object to validate.
   * @param {Array<Object>} schema - Schema definition to validate against.
   * @returns {boolean} - True if valid, false otherwise.
   */
  static validate(object, schema) {
    return validateObject(object, schema);
  }
}

module.exports = SecretEnv;
