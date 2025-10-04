// encryptEnvFile.js:

"use strict";

// load all necessary modules
const TopSecret = require("topsecret");

function encryptEnvFile(inputFile, outputFile, options) {
  // initialize the topsecret instance
  const ts = new TopSecret();

  // ensure the options parameter is passed and it has either a "key" or "keyFile" property
  if (!options) {
    throw new Error(`encryptEnvFile: The "Options" parameter is missing.`);
  } else if (options.key) {
    ts.key = options.key;
  } else if (options.keyFile) {
    ts.keyFile = options.keyFile;
  } else {
    throw new Error(
      `encryptKeyFile: "Options" parameter must provide either "key" or "keyFile" property.`
    );
  }

  // encrypt the plain text .env file
  ts.encryptFile(inputFile, outputFile);
}

module.exports = encryptEnvFile;
