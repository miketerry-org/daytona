// loadEnvFile.js:

"use strict";

const fs = require("fs");
const path = require("path");
const TopSecret = require("topsecret");
const isJsonLike = require("./isJsonLike.js");
const coercePrimitive = require("./coercePrimitive.js");
const validateValue = require("./validateValue.js");

/**
 * Load environment variables from a plaintext or encrypted file.
 * Returns a configuration object with typed accessors, optional validation,
 * and attached validation errors.
 *
 * @param {string} filename - Path to the environment file.
 * @param {string|null} [encryptKey=null] - Optional encryption key for secure config files.
 * @param {Array<object>} [schema=[]] - Optional validation schema to enforce variable constraints.
 * @returns {object} - Configuration object containing:
 *   - resolved key/value pairs
 *   - typed accessors (get, getString, getInteger, etc.)
 *   - `errors`: Array of validation error messages (if any)
 *   - `hasErrors`: Boolean indicating presence of validation issues
 *
 * @example
 * const config = loadEnvFile('.env', null, schema);
 * if (config.hasErrors) {
 *   console.error("Config validation errors:", config.errors);
 * }
 */
function loadEnvFile(filename, encryptKey = null, schema = []) {
  const resolvedPath = path.resolve(process.cwd(), filename);

  // throw error if specified file not found
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found at: ${resolvedPath}`);
  }

  let raw;

  if (!encryptKey) {
    raw = fs.readFileSync(resolvedPath, "utf-8");
  } else {
    const ts = new TopSecret();
    ts.key = encryptKey;
    raw = ts.decryptBufferFromFile(resolvedPath);
  }

  // split the buffer into individual lines
  const lines = raw.split(/\r?\n/);

  // initialize empty descriptors and raw values
  const descriptors = {};
  const rawValues = {};

  // loop thru all parsed lines
  lines.forEach(line => {
    // skip line if it is blank or starts with "#" comment symbol
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    // split the line into variable name and value
    const [name, ...rest] = trimmed.split("=");

    // if no name then skip line
    if (!name) {
      return;
    }

    // key is the trimmed environment variable name
    const key = name.trim();
    let value = rest.join("=").trim();

    // if the value appears to be a json object then parse it as one
    if (isJsonLike(value)) {
      try {
        value = JSON.parse(value);
      } catch {
        // fallback to plain string
      }
    } else {
      // for other values attempt to convert to basic javascript data types
      value = coercePrimitive(value);
    }

    // assign the key and value to the new raw values object
    rawValues[key] = value;

    // define the object property based on the key vand valuie
    descriptors[key] = {
      value,
      writable: false,
      enumerable: true,
      configurable: false,
    };
  });

  // validate against schema
  const errors = [];

  for (const rule of schema) {
    const key = rule.name;
    const value = rawValues[key];
    if (typeof value === "undefined") {
      throw new Error(`${key} is undefined!`);
    }
    const valErrors = validateValue(key, value, rule);
    if (valErrors.length > 0) {
      errors.push(...valErrors);
    } else {
      // update coerced/cleaned value if necessary
      descriptors[key].value = value;
    }
  }

  // Attach validation errors to the config object
  descriptors.errors = {
    value: errors,
    writable: false,
    enumerable: false,
    configurable: false,
  };

  // Optional convenience flag
  descriptors.hasErrors = {
    value: errors.length > 0,
    writable: false,
    enumerable: false,
    configurable: false,
  };

  const config = Object.defineProperties({}, descriptors);

  // Add typed and safe accessors to the config object
  Object.defineProperties(config, {
    /**
     * Retrieves a value by key, or returns the fallback value if not found.
     * @param {string} key - The key to retrieve.
     * @param {any} [fallback=null] - The fallback value if key is not found.
     * @returns {any} - The value associated with the key or the fallback value.
     */
    get: {
      value: (key, fallback = null) => config[key] ?? fallback,
      enumerable: false,
    },
    /**
     * Retrieves the value as a string, or returns the fallback value if not found or not a string.
     * @param {string} key - The key to retrieve.
     * @param {string} [fallback=null] - The fallback value if key is not found or value is not a string.
     * @returns {string} - The string value associated with the key.
     */
    getString: {
      value: (key, fallback = null) => {
        const val = config[key];
        return typeof val === "string" ? val : fallback;
      },
      enumerable: false,
    },
    /**
     * Retrieves the value as an integer, or returns the fallback value if not found or not a valid integer.
     * @param {string} key - The key to retrieve.
     * @param {number} [fallback=null] - The fallback value if key is not found or value is not a valid integer.
     * @returns {number} - The integer value associated with the key.
     */
    getInteger: {
      value: (key, fallback = null) => {
        const val = config[key];
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? fallback : parsed;
      },
      enumerable: false,
    },
    /**
     * Retrieves the value as a float, or returns the fallback value if not found or not a valid float.
     * @param {string} key - The key to retrieve.
     * @param {number} [fallback=null] - The fallback value if key is not found or value is not a valid float.
     * @returns {number} - The float value associated with the key.
     */
    getFloat: {
      value: (key, fallback = null) => {
        const val = config[key];
        const parsed = parseFloat(val);
        return isNaN(parsed) ? fallback : parsed;
      },
      enumerable: false,
    },
    /**
     * Retrieves the value as a boolean, or returns the fallback value if not found or not a valid boolean.
     * @param {string} key - The key to retrieve.
     * @param {boolean} [fallback=false] - The fallback value if key is not found or value is not a valid boolean.
     * @returns {boolean} - The boolean value associated with the key.
     */
    getBoolean: {
      value: (key, fallback = false) => {
        const val = config[key]?.toString().toLowerCase();
        if (val === "true") return true;
        if (val === "false") return false;
        return fallback;
      },
      enumerable: false,
    },
    /**
     * Retrieves the value as a Date, or returns the fallback value if not found or not a valid date.
     * @param {string} key - The key to retrieve.
     * @param {Date|null} [fallback=null] - The fallback value if key is not found or value is not a valid date.
     * @returns {Date|null} - The Date object associated with the key.
     */
    getDate: {
      value: (key, fallback = null) => {
        const val = config[key];
        const date = new Date(val);
        return isNaN(date.getTime()) ? fallback : date;
      },
      enumerable: false,
    },
    /**
     * Retrieves the value as a time, or returns the fallback value if not found or not a valid time.
     * @param {string} key - The key to retrieve.
     * @param {Date|null} [fallback=null] - The fallback value if key is not found or value is not a valid time.
     * @returns {Date|null} - The time value associated with the key, represented as a Date object.
     */
    getTime: {
      value: (key, fallback = null) => {
        const val = config[key];
        if (!/^\d{2}:\d{2}$/.test(val)) return fallback;

        const [hours, minutes] = val.split(":").map(Number);
        if (
          Number.isNaN(hours) ||
          Number.isNaN(minutes) ||
          hours < 0 ||
          hours > 23 ||
          minutes < 0 ||
          minutes > 59
        )
          return fallback;

        const time = new Date();
        time.setHours(hours, minutes, 0, 0);
        return time;
      },
      enumerable: false,
    },
    /**
     * Retrieves the value as an array, or returns the fallback value if not found or not an array.
     * @param {string} key - The key to retrieve.
     * @param {Array} [fallback=[]] - The fallback value if key is not found or value is not an array.
     * @returns {Array} - The array value associated with the key.
     */
    getArray: {
      value: (key, fallback = []) => {
        const val = config[key];
        return Array.isArray(val) ? val : fallback;
      },
      enumerable: false,
    },
    /**
     * Retrieves the value as an object, or returns the fallback value if not found or not an object.
     * @param {string} key - The key to retrieve.
     * @param {Object} [fallback={}] - The fallback value if key is not found or value is not an object.
     * @returns {Object} - The object value associated with the key.
     */
    getObject: {
      value: (key, fallback = {}) => {
        const val = config[key];
        return val && typeof val === "object" && !Array.isArray(val)
          ? val
          : fallback;
      },
      enumerable: false,
    },
  });

  return config;
}

module.exports = loadEnvFile;
