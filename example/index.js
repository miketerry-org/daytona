// index.js:

"use strict";

// load all necessary modules
const path = require("path");
const daytona = require("daytonajs");

class Server extends daytona.Configurable {
  validate(config) {
    console.log("validate");
  }
}

const server = new Server({ port: 3000 });
console.log("config", server.config);
