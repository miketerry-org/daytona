// configurable.test.js:

"use strict";

// load all necessary modules
const daytona = require("../index.js");

// example server configuration needed by the Application class
const config = {
  http_port: 3000,
  db_url: "mongodb://localhost:27017/testing",
  log_collection_name: "logs",
  log_expiration_days: 1,
  log_capped: false,
  log_max_size: 10,
  log_max_docs: 10000,
  rate_limit_minutes: 10,
  rate_limit_requests: 200,
  body_limit: "10k",
  session_secret:
    "2ab976ae98b6a83ca401a8dd15fefdc193c2d4702e56ea1d5efdea4174407d69",
  static_path: "public",
  views_path: "views",
  views_default_layout: "default_layout.hbs",
  views_layouts_path: "views/layouts",
  views_partials_path: "views/partials",
  emails_path: "emails",
};

class Server extends daytona.Configurable {
  validate(confirm) {
    confirm.isInteger("port", undefined, 1000, 65000, true);
  }
}

describe("constructor", () => {
  it("should not throw error when no config parameter passed to constructor", () => {
    const server = new Server();
    expect(server).toBeInstanceOf(Server);
  });

  it("should not throw error when valid config parameter passed to constructor", () => {
    const server = new Server({ port: 3000 });
    expect(server).toBeInstanceOf(Server);
    expect(server.config.port).toEqual(3000);
  });

  it("should throw errror when pass invalid parameter type to Server constructor", () => {
    expect(() => {
      const server = new Server("invalid parameter").throwError(
        `Error: The "config" parameter must be an object.`
      );
    });
  });
});
