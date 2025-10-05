// activeRecord.js

"use strict";

// load all necessary modules
const Base = require("./base");

class ActiveRecord extends Base {
  #db;

  constructor(db) {
    if (!db || typeof db !== "object") {
      throw new Error("ActiveRecord requires a Database instance.");
    }
    this.db = db;
  }

  async create(data) {
    this.notImplemented("create");
  }

  async update(data) {
    this.notImplemented("update");
  }

  async delete(id) {
    this.notImplemented("delete");
  }

  async findById(id) {
    this.notImplemented("findById");
  }

  async findBy(column, value) {
    this.notImplemented("findBy");
  }

  async findAll(criteria = "", params = {}, options = {}) {
    this.notImplemented("findAll");
  }

  async findOne(criteria = "", params = {}, options = {}) {
    this.notImplemented("findOne");
  }

  async count(criteria = "", params = {}) {
    this.notImplemented("count");
  }
}

module.exports = ActiveRecord;
