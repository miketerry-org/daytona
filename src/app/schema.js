"use strict";

// load all necessary modules
const Base = require("./base");

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

class Schema extends Base {
  _data;
  _errors;

  constructor(data) {
    super();
    this._data = data;
    this._errors = [];
  }

  static validate(data) {
    // ensure the data parameter is a non-null object (not array)
    if (data == null || typeof data !== "object" || Array.isArray(data)) {
      throw new Error(
        `data parameter for "${this.name}.validate" must be a non-null object`
      );
    }

    const instance = new this(data);
    instance.checkProperties();

    return {
      ok: instance._errors.length === 0,
      data: { ...instance._data }, // shallow copy
      errors: [...instance._errors], // copy of errors array
    };
  }

  checkProperties() {
    this.notImplemented("checkProperties");
  }

  _addError(name, message) {
    this._errors.push({ name, message });
  }
}
