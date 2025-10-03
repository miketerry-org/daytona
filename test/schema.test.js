// schema.test.js:

"use strict";

// load all necessary modules
const Schema = require("../src/app/schema");

class ServerConfigSchema extends Schema {
  define() {
    this.isInteger("http_port", true, 3000, 1000, 65000);
    this.isString("db_url", true, undefined, 1, 255);
    this.isString("log_table_name", true, undefined, 1, 255);
    this.isInteger("log_expiration_days", true, 30, 1, 90);
  }
}

const data = {};

const results = ServerConfigSchema.validate(data);

console.log("results", results);
