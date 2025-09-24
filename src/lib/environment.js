// environment.js:

"use strict";

/**
 * Normalization map: maps aliases to canonical environment mode names.
 */
const MODE_MAP = {
  dev: "development",
  development: "development",
  prod: "production",
  production: "production",
  test: "test",
  testing: "test",
  debug: "debug",
  debugging: "debug",
};

// Raw NODE_ENV (lowercased)
let rawEnv = process.env.NODE_ENV
  ? process.env.NODE_ENV.trim().toLowerCase()
  : null;

// Default to "production" if undefined
if (!rawEnv) {
  rawEnv = "production";
}

// Canonical environment mode
const envMode = MODE_MAP[rawEnv];

// Validate and exit if unrecognized
if (!envMode) {
  console.error(
    `Fatal: Unrecognized NODE_ENV value "${rawEnv}". Allowed values are: ${Object.keys(
      MODE_MAP
    ).join(", ")}`
  );
  process.exit(1);
}

// Booleans for conditional logic
const isDevelopment = envMode === "development";
const isProduction = envMode === "production";
const isTesting = envMode === "test";
const isDebug = envMode === "debug";

// Export constants
module.exports = {
  envMode,
  isDevelopment,
  isProduction,
  isTesting,
  isDebug,
};
