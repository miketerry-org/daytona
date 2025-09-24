// logger.js:

"use strict";

class Logger {
  clear() {
    console.clear();
  }

  debug(...args) {
    console.debug(args);
  }

  error(...args) {
    console.error(args);
  }

  info(...args) {
    console.log(args);
  }

  log(...args) {
    console.log(args);
  }

  warn(...args) {
    console.warn(args);
  }
}

module.exports = Logger;
