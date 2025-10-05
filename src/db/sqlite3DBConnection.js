// sqlite3DBConnection.js:

"use strict";

const DBConnection = require("./dbConnection");
const Database = require("better-sqlite3");

class Sqlite3Connection extends DBConnection {
  constructor(config = {}) {
    super(config);
    this._db = null;
    this._inTransaction = false;
  }

  async _connectInternal() {
    const dbPath = this.config.path || ":memory:";
    this._db = new Database(dbPath);
  }

  async _disconnectInternal() {
    if (this._db) {
      this._db.close();
      this._db = null;
    }
  }

  // Synchronous query execution (emulated async interface)
  async query(sql, params = []) {
    const stmt = this._db.prepare(sql);
    if (stmt.reader) {
      return stmt.all(params);
    } else {
      const result = stmt.run(params);
      return result;
    }
  }

  // CRUD methods
  async insert(table, row) {
    const keys = Object.keys(row);
    const placeholders = keys.map(() => "?").join(", ");
    const sql = `INSERT INTO ${table} (${keys.join(
      ", "
    )}) VALUES (${placeholders})`;
    const values = Object.values(row);
    return this.query(sql, values);
  }

  async update(table, id, updates) {
    const keys = Object.keys(updates);
    const setClause = keys.map(k => `${k} = ?`).join(", ");
    const values = [...Object.values(updates), id];
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    return this.query(sql, values);
  }

  async delete(table, id) {
    return this.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
  }

  async findById(table, id) {
    const rows = await this.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  async findBy(table, column, value) {
    const rows = await this.query(
      `SELECT * FROM ${table} WHERE ${column} = ?`,
      [value]
    );
    return rows;
  }

  async findAll(table, criteria = {}, options = {}) {
    const whereClauses = [];
    const values = [];

    for (const [key, val] of Object.entries(criteria)) {
      whereClauses.push(`${key} = ?`);
      values.push(val);
    }

    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";
    const limit = options.limit ? `LIMIT ${options.limit}` : "";
    const offset = options.offset ? `OFFSET ${options.offset}` : "";

    const sql = `SELECT * FROM ${table} ${where} ${limit} ${offset}`;
    return this.query(sql, values);
  }

  async findOne(table, criteria = {}, options = {}) {
    const rows = await this.findAll(table, criteria, { ...options, limit: 1 });
    return rows[0] || null;
  }

  async count(table, criteria = {}) {
    const whereClauses = [];
    const values = [];

    for (const [key, val] of Object.entries(criteria)) {
      whereClauses.push(`${key} = ?`);
      values.push(val);
    }

    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";
    const sql = `SELECT COUNT(*) as count FROM ${table} ${where}`;
    const result = await this.query(sql, values);
    return result[0]?.count || 0;
  }

  // Schema methods
  async createTable(table, schema) {
    const columns = Object.entries(schema)
      .map(([name, type]) => `${name} ${type}`)
      .join(", ");
    const sql = `CREATE TABLE IF NOT EXISTS ${table} (${columns})`;
    return this.query(sql);
  }

  async dropTable(table) {
    return this.query(`DROP TABLE IF EXISTS ${table}`);
  }

  async createIndex(table, columns, options = {}) {
    const name = options.name || `idx_${table}_${columns.join("_")}`;
    const unique = options.unique ? "UNIQUE" : "";
    const cols = columns.join(", ");
    const sql = `CREATE ${unique} INDEX IF NOT EXISTS ${name} ON ${table} (${cols})`;
    return this.query(sql);
  }

  async dropIndex(table, indexName) {
    const sql = `DROP INDEX IF EXISTS ${indexName}`;
    return this.query(sql);
  }

  // Transactions
  async beginTransaction() {
    if (!this._inTransaction) {
      this._db.prepare("BEGIN").run();
      this._inTransaction = true;
    }
  }

  async commit() {
    if (this._inTransaction) {
      this._db.prepare("COMMIT").run();
      this._inTransaction = false;
    }
  }

  async rollback() {
    if (this._inTransaction) {
      this._db.prepare("ROLLBACK").run();
      this._inTransaction = false;
    }
  }
}

module.exports = Sqlite3Connection;
