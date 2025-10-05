// mongodbConnection.js:

"use strict";

// load all necessay modules
const { MongoClient, ObjectId } = require("mongodb");
const DBConnection = require("./dbConnection");

class MongoDBConnection extends DBConnection {
  constructor(config = {}) {
    super(config);
    this._client = null;
    this._db = null;
  }

  async _connectInternal() {
    const uri = this.config.uri || "mongodb://localhost:27017";
    const dbName = this.config.database || "test";

    this._client = new MongoClient(uri, { useUnifiedTopology: true });
    await this._client.connect();
    this._db = this._client.db(dbName);
  }

  async _disconnectInternal() {
    if (this._client) {
      await this._client.close();
      this._client = null;
      this._db = null;
    }
  }

  getCollection(table) {
    if (!this._db) throw new Error("Database not connected");
    return this._db.collection(table);
  }

  async insert(table, doc) {
    const collection = this.getCollection(table);
    const result = await collection.insertOne(doc);
    return result.insertedId;
  }

  async update(table, idOrCriteria, updates) {
    const collection = this.getCollection(table);
    const filter = this._buildFilter(idOrCriteria);
    const result = await collection.updateOne(filter, { $set: updates });
    return result.modifiedCount;
  }

  async delete(table, idOrCriteria) {
    const collection = this.getCollection(table);
    const filter = this._buildFilter(idOrCriteria);
    const result = await collection.deleteOne(filter);
    return result.deletedCount;
  }

  async findById(table, id) {
    const collection = this.getCollection(table);
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  async findBy(table, field, value) {
    const collection = this.getCollection(table);
    return await collection.find({ [field]: value }).toArray();
  }

  async findAll(table, criteria = {}, options = {}) {
    const collection = this.getCollection(table);
    const cursor = collection.find(criteria);

    if (options.limit) cursor.limit(options.limit);
    if (options.skip) cursor.skip(options.skip);
    if (options.sort) cursor.sort(options.sort);

    return await cursor.toArray();
  }

  async findOne(table, criteria = {}, options = {}) {
    const collection = this.getCollection(table);
    return await collection.findOne(criteria, options);
  }

  async count(table, criteria = {}) {
    const collection = this.getCollection(table);
    return await collection.countDocuments(criteria);
  }

  async createIndex(table, fields, options = {}) {
    const collection = this.getCollection(table);
    return await collection.createIndex(fields, options);
  }

  async dropIndex(table, indexName) {
    const collection = this.getCollection(table);
    return await collection.dropIndex(indexName);
  }

  async dropTable(table) {
    const collection = this.getCollection(table);
    return await collection.drop();
  }

  async createTable(table, options = {}) {
    return await this._db.createCollection(table, options);
  }

  async beginTransaction() {
    throw new Error(
      "MongoDB transactions not implemented in base class (requires session)."
    );
  }

  async commit() {
    throw new Error("MongoDB transactions not implemented in base class.");
  }

  async rollback() {
    throw new Error("MongoDB transactions not implemented in base class.");
  }

  async mongoCommand(command, options = {}) {
    return await this._db.command(command, options);
  }

  _buildFilter(idOrCriteria) {
    if (typeof idOrCriteria === "string" || idOrCriteria instanceof ObjectId) {
      return { _id: new ObjectId(idOrCriteria) };
    }
    return idOrCriteria;
  }
}

module.exports = MongoDBConnection;
