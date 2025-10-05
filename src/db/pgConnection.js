// pgConnection.js:

"use strict";

// load all necessary modules
const { Pool } = require("pg");
const DBConnection = require("./dbConnection");

class PostgresDBConnection extends DBConnection {
  constructor(config = {}) {
    super(config);
    this._pool = null;
    this._transactionClient = null; // holds client in a transaction
  }

  async _connectInternal() {
    // Create a connection pool
    // The config might include host, user, password, database, port, ssl, etc.
    this._pool = new Pool(this.config);
    // Optionally handle error events on pool
    this._pool.on("error", (err, client) => {
      console.error("Unexpected error on idle Postgres client", err);
      // You might want to process.exit(1) in some apps, or throw/log
    });
  }

  async _disconnectInternal() {
    if (this._pool) {
      await this._pool.end();
      this._pool = null;
    }
  }

  // Core query method
  async query(sql, params = []) {
    if (this._transactionClient) {
      // If we are inside a transaction, use that client
      return this._transactionClient.query(sql, params);
    } else {
      // Otherwise, use pool convenience
      return this._pool.query(sql, params);
    }
  }

  // CRUD / high-level methods

  async insert(table, row) {
    const columns = Object.keys(row);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO ${table} (${columns.join(
      ", "
    )}) VALUES (${placeholders}) RETURNING *`;
    const params = Object.values(row);
    const res = await this.query(sql, params);
    return res.rows[0];
  }

  async update(table, idOrCriteria, updates) {
    const keys = Object.keys(updates);
    const setClause = keys.map((k, idx) => `${k} = $${idx + 1}`).join(", ");
    const values = Object.values(updates);

    let filterSql;
    let filterParams = [];

    if (typeof idOrCriteria === "object") {
      // build WHERE from criteria object
      const whereClauses = [];
      let offset = keys.length;
      for (const [k, v] of Object.entries(idOrCriteria)) {
        whereClauses.push(`${k} = $${++offset}`);
        filterParams.push(v);
      }
      filterSql = `WHERE ${whereClauses.join(" AND ")}`;
    } else {
      // assume id = primary key column "id"
      filterSql = `WHERE id = $${keys.length + 1}`;
      filterParams = [idOrCriteria];
    }

    const sql = `UPDATE ${table} SET ${setClause} ${filterSql} RETURNING *`;
    const params = [...values, ...filterParams];
    const res = await this.query(sql, params);
    return res.rows;
  }

  async delete(table, idOrCriteria) {
    let sql, params;
    if (typeof idOrCriteria === "object") {
      const where = [];
      params = [];
      Object.entries(idOrCriteria).forEach(([k, v], idx) => {
        where.push(`${k} = $${idx + 1}`);
        params.push(v);
      });
      sql = `DELETE FROM ${table} WHERE ${where.join(" AND ")}`;
    } else {
      sql = `DELETE FROM ${table} WHERE id = $1`;
      params = [idOrCriteria];
    }
    const res = await this.query(sql, params);
    return res.rowCount;
  }

  async findById(table, id) {
    const res = await this.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  async findBy(table, column, value) {
    const res = await this.query(
      `SELECT * FROM ${table} WHERE ${column} = $1`,
      [value]
    );
    return res.rows;
  }

  async findAll(table, criteria = {}, options = {}) {
    const where = [];
    const params = [];
    let idx = 0;
    for (const [k, v] of Object.entries(criteria)) {
      where.push(`${k} = $${++idx}`);
      params.push(v);
    }
    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const limitClause = options.limit ? `LIMIT ${options.limit}` : "";
    const offsetClause = options.offset ? `OFFSET ${options.offset}` : "";
    const sql = `SELECT * FROM ${table} ${whereClause} ${limitClause} ${offsetClause}`;
    const res = await this.query(sql, params);
    return res.rows;
  }

  async findOne(table, criteria = {}, options = {}) {
    const rows = await this.findAll(table, criteria, { ...options, limit: 1 });
    return rows[0] || null;
  }

  async count(table, criteria = {}) {
    const where = [];
    const params = [];
    let idx = 0;
    for (const [k, v] of Object.entries(criteria)) {
      where.push(`${k} = $${++idx}`);
      params.push(v);
    }
    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sql = `SELECT COUNT(*)::int as count FROM ${table} ${whereClause}`;
    const res = await this.query(sql, params);
    return res.rows[0].count;
  }

  // Schema methods (simplified)
  async createTable(table, schema) {
    const cols = Object.entries(schema)
      .map(([col, type]) => `${col} ${type}`)
      .join(", ");
    const sql = `CREATE TABLE IF NOT EXISTS ${table} (${cols})`;
    await this.query(sql);
  }

  async dropTable(table) {
    await this.query(`DROP TABLE IF EXISTS ${table}`);
  }

  async createIndex(table, columns, options = {}) {
    const name = options.name || `idx_${table}_${columns.join("_")}`;
    const unique = options.unique ? "UNIQUE" : "";
    const cols = columns.join(", ");
    const sql = `CREATE ${unique} INDEX IF NOT EXISTS ${name} ON ${table} (${cols})`;
    await this.query(sql);
  }

  async dropIndex(table, indexName) {
    const sql = `DROP INDEX IF EXISTS ${indexName}`;
    await this.query(sql);
  }

  // Transaction methods
  async beginTransaction() {
    if (this._transactionClient) {
      throw new Error("Transaction already in progress");
    }
    const client = await this._pool.connect();
    this._transactionClient = client;
    await client.query("BEGIN");
  }

  async commit() {
    if (!this._transactionClient) {
      throw new Error("No transaction in progress");
    }
    await this._transactionClient.query("COMMIT");
    this._transactionClient.release();
    this._transactionClient = null;
  }

  async rollback() {
    if (!this._transactionClient) {
      throw new Error("No transaction in progress");
    }
    await this._transactionClient.query("ROLLBACK");
    this._transactionClient.release();
    this._transactionClient = null;
  }
}

module.exports = PostgresDBConnection;
