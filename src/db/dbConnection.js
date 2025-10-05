// dbConnection.js:

"use strict";

const Configurable = require("../app/configurable");

class DBConnection extends Configurable {
  constructor(config = {}) {
    super(config);

    if (new.target === DBConnection) {
      throw new Error("DBConnection is abstract and must be subclassed.");
    }

    this._connected = false;
  }

  // ----- Connection lifecycle -----
  async connect() {
    if (this._connected) return;
    await this._connectInternal();
    this._connected = true;
  }

  async disconnect() {
    if (!this._connected) return;
    await this._disconnectInternal();
    this._connected = false;
  }

  async _connectInternal() {
    this._notImplemented("_connectInternal");
  }

  async _disconnectInternal() {
    this._notImplemented("_disconnectInternal");
  }

  // ----- Core query interface (relational DBs) -----
  async query(sql, params = []) {
    this._notImplemented("query");
  }

  // ----- MongoDB-specific interface -----
  async mongoCommand(command, options = {}) {
    this._notImplemented("mongoCommand");
  }

  // ----- Schema management -----
  async createTable(table, schema) {
    this._notImplemented("createTable");
  }

  async dropTable(table) {
    this._notImplemented("dropTable");
  }

  async createIndex(table, columns, options = {}) {
    this._notImplemented("createIndex");
  }

  async dropIndex(table, indexName) {
    this._notImplemented("dropIndex");
  }

  // ----- CRUD Operations -----
  async insert(table, row) {
    this._notImplemented("insert");
  }

  async update(table, idOrCriteria, updates) {
    this._notImplemented("update");
  }

  async delete(table, idOrCriteria) {
    this._notImplemented("delete");
  }

  async findById(table, id) {
    this._notImplemented("findById");
  }

  async findBy(table, column, value) {
    this._notImplemented("findBy");
  }

  async findAll(table, criteria = {}, options = {}) {
    this._notImplemented("findAll");
  }

  async findOne(table, criteria = {}, options = {}) {
    this._notImplemented("findOne");
  }

  async count(table, criteria = {}) {
    this._notImplemented("count");
  }

  // ----- Transactions (if supported) -----
  async beginTransaction() {
    this._notImplemented("beginTransaction");
  }

  async commit() {
    this._notImplemented("commit");
  }

  async rollback() {
    this._notImplemented("rollback");
  }

  // ----- Utility -----
  _notImplemented(methodName) {
    const className = this.constructor.name;
    throw new Error(`${className}.${methodName} is not implemented`);
  }
}

module.exports = DBConnection;
