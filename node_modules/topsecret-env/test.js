// example for topsecret-env module

"use strict";

// load all necessary modules
const SecretEnv = require("./index.js");

try {
  const schema = [
    { name: "port", type: "integer", required: true },
    { name: "db_url", type: "string", required: true, min: 10, max: 255 },
    { name: "log_collection_name2", type: "integer" },
    //    { name: "db_username", type: "string", require: false },
  ];

  const config = SecretEnv.loadFromFile("./server.env", null, schema);
  console.log("config", config);
  console.log();

  let filtered = SecretEnv.maskKeys(config, ["user_roles"]);
  console.log("filtered", filtered);
} catch (err) {
  console.error(err.message);
}
