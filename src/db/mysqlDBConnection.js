// mysqlDBConnection.js:

"use strict";

// load all necessary modules
const mysql = require("mysql2/promise");
const DBConnection = require("./dbConnection");

class MySQLDBConnection extends DBConnection {
  constructor(config = {}) {
    super(config);
    this._pool = null;
    this._connection = null; // used for transactions
  }

  async _connectInternal() {
    this._pool = mysql.createPool({
      host: this.config.host || "localhost",
      port: this.config.port || 3306,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      waitForConnections: true,
      connectionLimit: this.config.connectionLimit || 10,
      queueLimit: 0,
    });
  }

  async _disconnectInternal() {
    if (this._pool) {
      await this._pool.end();
      this._pool = null;
    }
  }

  async query(sql, params = []) {
    const conn = this._connection || this._pool;
    const [rows] = await conn.execute(sql, params);
    return rows;
  }

  // CRUD Operations
  async insert(table, row) {
    const columns = Object.keys(row);
    const placeholders = columns.map(() => "?").join(", ");
    const sql = `INSERT INTO \`${table}\` (${columns.join(
      ", "
    )}) VALUES (${placeholders})`;
    const values = Object.values(row);
    const result = await this.query(sql, values);
    return { insertId: result.insertId };
  }

  async update(table, idOrCriteria, updates) {
    const keys = Object.keys(updates);
    const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
    const values = Object.values(updates);

    let whereClause = "";
    let filterValues = [];

    if (typeof idOrCriteria === "object") {
      const criteria = Object.entries(idOrCriteria).map(
        ([k], i) => `\`${k}\` = ?`
      );
      filterValues = Object.values(idOrCriteria);
      whereClause = `WHERE ${criteria.join(" AND ")}`;
    } else {
      whereClause = "WHERE `id` = ?";
      filterValues = [idOrCriteria];
    }

    const sql = `UPDATE \`${table}\` SET ${setClause} ${whereClause}`;
    const result = await this.query(sql, [...values, ...filterValues]);
    return result.affectedRows;
  }

  async delete(table, idOrCriteria) {
    let sql, values;
    if (typeof idOrCriteria === "object") {
      const conditions = Object.entries(idOrCriteria).map(
        ([k]) => `\`${k}\` = ?`
      );
      values = Object.values(idOrCriteria);
      sql = `DELETE FROM \`${table}\` WHERE ${conditions.join(" AND ")}`;
    } else {
      sql = `DELETE FROM \`${table}\` WHERE id = ?`;
      values = [idOrCriteria];
    }
    const result = await this.query(sql, values);
    return result.affectedRows;
  }

  async findById(table, id) {
    const rows = await this.query(
      `SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async findBy(table, column, value) {
    const rows = await this.query(
      `SELECT * FROM \`${table}\` WHERE \`${column}\` = ?`,
      [value]
    );
    return rows;
  }

  async findAll(table, criteria = {}, options = {}) {
    const where = [];
    const values = [];

    for (const [key, val] of Object.entries(criteria)) {
      where.push(`\`${key}\` = ?`);
      values.push(val);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const limit = options.limit ? `LIMIT ${options.limit}` : "";
    const offset = options.offset ? `OFFSET ${options.offset}` : "";

    const sql = `SELECT * FROM \`${table}\` ${whereClause} ${limit} ${offset}`;
    return await this.query(sql, values);
  }

  async findOne(table, criteria = {}, options = {}) {
    const rows = await this.findAll(table, criteria, { ...options, limit: 1 });
    return rows[0] || null;
  }

  async count(table, criteria = {}) {
    const where = [];
    const values = [];

    for (const [key, val] of Object.entries(criteria)) {
      where.push(`\`${key}\` = ?`);
      values.push(val);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sql = `SELECT COUNT(*) AS count FROM \`${table}\` ${whereClause}`;
    const result = await this.query(sql, values);
    return result[0]?.count || 0;
  }

  // Schema
  async createTable(table, schema) {
    const cols = Object.entries(schema)
      .map(([name, type]) => `\`${name}\` ${type}`)
      .join(", ");
    const sql = `CREATE TABLE IF NOT EXISTS \`${table}\` (${cols})`;
    await this.query(sql);
  }

  async dropTable(table) {
    await this.query(`DROP TABLE IF EXISTS \`${table}\``);
  }

  async createIndex(table, columns, options = {}) {
    const name = options.name || `idx_${table}_${columns.join("_")}`;
    const unique = options.unique ? "UNIQUE" : "";
    const cols = columns.map(c => `\`${c}\``).join(", ");
    const sql = `CREATE ${unique} INDEX \`${name}\` ON \`${table}\` (${cols})`;
    await this.query(sql);
  }

  async dropIndex(table, indexName) {
    const sql = `DROP INDEX \`${indexName}\` ON \`${table}\``;
    await this.query(sql);
  }

  // Transaction support
  async beginTransaction() {
    if (this._connection) throw new Error("Transaction already in progress");
    this._connection = await this._pool.getConnection();
    await this._connection.beginTransaction();
  }

  async commit() {
    if (!this._connection) throw new Error("No transaction in progress");
    await this._connection.commit();
    await this._connection.release();
    this._connection = null;
  }

  async rollback() {
    if (!this._connection) throw new Error("No transaction in progress");
    await this._connection.rollback();
    await this._connection.release();
    this._connection = null;
  }
}

module.exports = MySQLDBConnection;
