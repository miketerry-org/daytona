// src/app/configurable.js

"use strict";

// load all necessary modules
const fs = require("fs");
const path = require("path");
const SecretEnv = require("topsecret-env");
const { isProduction } = require("../lib/environment");
const Base = require("./base");

// if not in production mode then load encryption key from the ".env" file
if (!isProduction) {
  require("dotenv").config();
}

// Final validation for ENCRYPT_KEY in all environments
if (!process.env.ENCRYPT_KEY || process.env.ENCRYPT_KEY.length !== 64) {
  console.error(
    `The "ENCRYPT_KEY" environment variable is missing or not exactly 64 characters!`
  );
  process.exit(1);
}

class Configurable extends Base {
  #config = {};

  constructor(config = undefined) {
    // call parent constructor
    super();

    // if config parameter passed then process it
    if (config) {
      this.#processConfig(config);
    }
  }

  loadEnvFile(filename) {
    this.processConfig();
  }

  validate(confirm) {
    this.notImplemented(`validateConfig`);
  }

  #processConfig(config) {
    // throw error if config is not an object
    if (typeof config !== "object") {
      this.throwError(`The "config" parameter must be an object.`);
    }

    // instanciate confirm  instance
    const confirm = new Confirm(config);

    // ensure all config properties are valid
    this.validate(confirm);
    console.log("confirm", confirm);

    // copy all values inside config parameter
    this.#config = { ...config };
  }

  get config() {
    return this.#config;
  }
}

module.exports = Configurable;
