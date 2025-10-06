// index.js:

"use strict";

// if not in production mode then load encryption key from the ".env" file
const { isProduction } = require("../lib/environment");
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

// load all necessary modules
const Application = require("./src/app/application");
const Base = require("./src/app/base");
const Configurable = require("./src/app/configurable");
const Controller = require("./src/app/controller");
const Database = require("./src/app/database");
const Logger = require("./src/app/logger");
const Mailer = require("./src/app/mailer");
const Model = require("./src/app/model");
const Schema = require("./src/app/schema");
const Service = require("./src/app/service");
const TenantManager = require("./src/app/tenantManager");

module.exports = {
  Application,
  Configurable,
  Controller,
  Database,
  Logger,
  Mailer,
  Model,
  Schema,
  Service,
  TenantManager,
};
