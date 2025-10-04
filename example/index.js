// index.js:

"use strict";

process.env.ENCRYPT_KEY =
  "cd82e8f9132c94a4cd3622b58c8f72b5d881d0dbe8c86aaf0091ff860cc49dad";

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
