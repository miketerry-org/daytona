"use strict";

// load all necessary modules
const Base = require("./base");

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

class Schema extends Base {
  #data;
  #errors;
  #name;
  #value;
  #valueOK;

  constructor(data) {
    super();
    if (typeof data !== "object") {
      this.throwError(500, `"${this.className}" must be passed an object`);
    }

    this.#data = data;
    this.#errors = [];
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
    return this._response();
  }

  checkProperties() {
    this.notImplemented("checkProperties");
  }

  expectArray(name, required, defaultValue, min, max) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._checkType(["array"]);
    this._checkRange(min, max);
  }

  expectBoolean(name, required, defaultValue) {}
  expectDate(name, required, defaultValue, min, max) {}
  expectDuplicate(name, duplicateName) {}
  expectEmail(name, required, defaultValue) {}
  expectEnum(name, required, defaultValue, validValues) {}
  expectFloat(name, required, defaultValue, min, max) {}
  expectInteger(name, required, defaultValue, min, max) {}
  expectMatch(name, required, defaultValue, expression) {}
  expectNumber(name, required, defaultValue, min, max) {}
  expectPassword(name, required, defaultValue) {}
  expectString(name, required, defaultValue, min, max) {}
  expectTime(name, required, defaultValue) {}
  expectTimestamp(name, required, defaultValue) {}

  /*
   * private declarations
   */

  _addError(message) {
    // only add error if first error for this value
    if (this.valueOK) {
      this._errors.push({ name: this.#name, message });
      this.#valueOK = false;
    }
  }

  _checkName(name = "") {
    // remember property name being verified
    this.#name = name;

    // get the value from the data object
    this.#value = this.#data[name];

    // new property being verified so reset ok status
    this.#valueOK = true;
  }

  _checkRange(min = undefined, max = undefined) {
    if (min && this.#value < min) {
      this._addError(`"${this.#name}" cannot be less than ${min}`);
    } else if (max && this.#value > max) {
      this._addError(`"${this.#name}" cannot be greater than ${max}`);
    }
  }

  _checkRequired(required = false, defaultValue = undefined) {
    // only proceed if property is undefined an is required
    if (this.value || !required) {
      return;
    }

    // if a default value is passed then assign to data object and to working value
    if (defaultValue) {
      this.#data[this.#name] = defaultValue;
      this.#value = defaultValue;
    }

    // if value is still undefined then it is required and is missing
    if (!this.value) {
      this._addError(`"${this.#name}" is required!`);
    }
  }

  _checkType(types = []) {
    // get the type of the current property value
    const type = typeof this.#value;

    // if the type is not in valid array
    if (!(type in types)) {
      this._addError(
        `"${this.name}" is typee "${type}" but should be [${types}]`
      );
    }
  }

  _parseBoolean(value) {}
  _parseDate() {}
  _parseFloat() {}
  _parseInteger() {}
  _parseNumber() {}
  _parseTime() {}
  _parseTimestamp() {}

  _response() {
    return {
      ok: this.#errors.length === 0,
      data: { ...this.#data },
      errors: [...this.#errors],
    };
  }
}

module.exports = Schema;
