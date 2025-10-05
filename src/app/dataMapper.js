// dataMapper.js

class DataMapper {
  /**
   * @param {import('better-sqlite3')} db - A better-sqlite3 database instance
   * @param {string} tableName - The name of the table this mapper handles
   */
  constructor(db, tableName) {
    if (!db || !tableName) {
      throw new Error(
        "DataMapper requires a database instance and table name."
      );
    }
    this.db = db;
    this.tableName = tableName;
  }

  /**
   * Find a record by ID.
   * @param {number|string} id
   * @returns {Object|null}
   */
  findById(id) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE id = ?`
    );
    return stmt.get(id) || null;
  }

  /**
   * Return all records from the table.
   * @returns {Array<Object>}
   */
  findAll() {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
    return stmt.all();
  }

  /**
   * Find records by a custom WHERE clause.
   * @param {string} whereClause - SQL where clause without 'WHERE'
   * @param {Array<any>} params - Values to bind
   * @returns {Array<Object>}
   */
  findWhere(whereClause, params = []) {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause}`
    );
    return stmt.all(...params);
  }

  /**
   * Insert a new record into the table.
   * @param {Object} entity - Plain object representing column-value pairs
   * @returns {number} The ID of the inserted row
   */
  insert(entity) {
    const keys = Object.keys(entity);
    const values = keys.map(k => entity[k]);
    const placeholders = keys.map(() => "?").join(", ");

    const sql = `INSERT INTO ${this.tableName} (${keys.join(
      ", "
    )}) VALUES (${placeholders})`;
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...values);
    return result.lastInsertRowid;
  }

  /**
   * Update a record by ID.
   * @param {number|string} id
   * @param {Object} entity - Fields to update
   * @returns {boolean} True if a row was updated
   */
  update(id, entity) {
    const keys = Object.keys(entity);
    if (keys.length === 0) return false;

    const assignments = keys.map(k => `${k} = ?`).join(", ");
    const values = keys.map(k => entity[k]);

    const sql = `UPDATE ${this.tableName} SET ${assignments} WHERE id = ?`;
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...values, id);
    return result.changes > 0;
  }

  /**
   * Delete a record by ID.
   * @param {number|string} id
   * @returns {boolean} True if a row was deleted
   */
  delete(id) {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Count the number of records (optionally filtered).
   * @param {string} [whereClause] Optional WHERE clause
   * @param {Array<any>} [params] Parameters for the WHERE clause
   * @returns {number}
   */
  count(whereClause = "", params = []) {
    const sql =
      `SELECT COUNT(*) as count FROM ${this.tableName}` +
      (whereClause ? ` WHERE ${whereClause}` : "");
    const stmt = this.db.prepare(sql);
    const result = stmt.get(...params);
    return result.count;
  }
}

module.exports = DataMapper;
