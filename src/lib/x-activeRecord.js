// activeRecord.js

"use strict";

class ActiveRecord {
  /**
   * @param {Database} db - An instance of your custom Database class
   * @param {object} schema - Schema definition for the table
   *   {
   *     table: "users",
   *     columns: [
   *       { name: "id", type: "INTEGER", primaryKey: true },
   *       { name: "email", type: "TEXT", unique: true },
   *       ...
   *     ]
   *   }
   */
  constructor(db, schema) {
    if (!db || typeof db !== "object") {
      throw new Error("ActiveRecord requires a Database instance.");
    }
    if (
      !schema ||
      typeof schema !== "object" ||
      !schema.table ||
      !schema.columns
    ) {
      throw new Error("Schema must include 'table' and 'columns'.");
    }

    this.db = db;
    this.schema = schema;
    this.table = schema.table.toUpperCase();
    this.columns = schema.columns;
    this.primaryKey = this.#findPrimaryKey();
  }

  #findPrimaryKey() {
    const pk = this.columns.find(
      c => c.primaryKey || c.name.toUpperCase() === "ID"
    );
    return pk?.name || "id";
  }

  async create(data) {
    return this.db.insert(this.table, this.columns, data);
  }

  async update(data) {
    if (!data[this.primaryKey]) {
      throw new Error(`Cannot update without "${this.primaryKey}"`);
    }
    return this.db.update(this.table, this.columns, data);
  }

  async delete(id) {
    return this.db.delete(this.table, id);
  }

  async findById(id) {
    return this.db.findById(this.table, this.columns, id);
  }

  async findBy(column, value) {
    return this.db.findByColumn(this.table, this.columns, column, value);
  }

  async findAll(criteria = "", params = {}, options = {}) {
    return this.db.findMany(
      this.table,
      this.columns,
      criteria,
      params,
      options
    );
  }

  async findOne(criteria = "", params = {}, options = {}) {
    return this.db.findOne(this.table, this.columns, criteria, params, options);
  }

  async count(criteria = "", params = {}) {
    const results = await this.db.query(
      `SELECT COUNT(*) as count FROM ${this.table} ${
        criteria ? "WHERE " + criteria : ""
      }`,
      params,
      {},
      this.columns
    );
    return results[0]?.count || 0;
  }

  getColumnNames() {
    return this.columns.map(c => c.name);
  }

  getSchema() {
    return this.schema;
  }
}

module.exports = ActiveRecord;
