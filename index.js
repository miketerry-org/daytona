// index.js:

"use strict";

// load all necessary modules
const Application = require("./app/application");
const Base = require("./app/base");
const Config = require("./app/config");
const Controller = require("./app/controller");
const Database = require("./app/database");
const Logger = require("./app/logger");
const Mailer = require("./app/mailer");
const Model = require("./app/model");
const Service = require("./app/service");
const TenantManager = require("./app/tenantManager");

module.exports = {
  Application,
  Config,
  Controller,
  Database,
  Logger,
  Mailer,
  Model,
  Service,
  TenantManager,
};
