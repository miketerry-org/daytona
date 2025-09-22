// base.js:

"use strict";

class Base {
  #logger;

  constructor() {
    this.#logger = console;
  }

  get logger() {
    return this.#logger;
  }
}

module.exports = Base;
