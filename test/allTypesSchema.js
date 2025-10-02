//

class Schema extends Base {
  #data = undefined;
  #errors = [];

  addError(name, message) {
    this.errors.push({ name, message });
    return null;
  }

  reset() {
    this.#data = undefined;
    this.#errors = [];
  }

  validate(data) {
    this.reset();
  }

  get errors() {
    return this.#errors;
  }

  get ok() {
    return this.#errors.length === 0;
  }

  getValue(name, required, defaultValue = undefined) {
    // attempt to get the value from the data object
    let value = this.#data[name];

    // if value found then return it
    if (value) {
      return value;
    } else if (required) {
      // add error and return null if not found and is required
      this.addError(name, `"${name}" is required!`);
      return null;
    } else {
      // value not found and not required so return any default value
      return defaultValue;
    }
  }

  isArray(name, required, min, max) {
    // get the property value from the data object
    let value = this.getValue(name, required, undefined);

    // return if the property is not defined
    if (value === null || value === undefined) {
      return;
    }

    // ensure the property is an array
    if (typeof value !== "array") {
      return this.addError(name, `"${name}" must be an "array"`);
    }

    // if min length define then check length
    if (min && value.length < min) {
      return this.addError(
        name,
        `"${name} must have a length of atleast ${min}`
      );
    }

    // if max length specified then check length
    if (max && value.length > max) {
      return this.addError(
        name,
        `"${name} must have a length of no more then ${max}`
      );
    }

    // return the value
    return value;
  }

  isBoolean(name, required, defaultValue) {
    let value = getValue(name, required, defaultValue);
    if (value && typeof value !== "boolean") {
      return this.addError(name, `"${name}" must be a "boolean" value`);
    }
  }

  isDate(name, required, defaultValue) {
    let value = this.getValue(name, required, defaultValue);
    return value;
  }

  isDuplicate(name, duplicateName) {
    let value1 = this.getValue(name, true, undefined);
    let value2 = this.getValue(duplicateName, true, undefined);
    return value2;
  }

  isEmail(name, required, defaultValue) {
    let value = this.getValue(name, required, defaultValue);
    return value;
  }

  isEnum(name, required, defaultValue, validValues) {
    let value = this.getValue(name, required, defaultValue);
    return value;
  }

  isFloat(name, required, defaultValue, min, max) {
    let value = this.getValue(name, required, defaultValue);
    return value;
  }

  isInteger(name, required, defaultValue, min, max) {
    let value = this.getValue(name, required, defaultValue);
    return value;
  }

  isNumber(name, required, defaultValue, min, max) {
    let value = this.getValue(name, required, defaultValue);
    return value;
  }

  isPassword(name, required, min, max) {
    let value = this.getValue(name, required, undefined);
    return value;
  }

  isRegEx(name, required, defaultValue, match) {
    let value = this.getValue(name, required, defaultValue);
    return value;
  }

  isString(name, require, min, max) {
    let value = this.getValue(name, required, undefined);
    return value;
  }

  isTime(name, required, defaultValue) {
    let value = this.getValue(name, required, defaultValue);
    return value;
  }

  isTimestamp(name, required, defaultValue) {
    let value = this.getValue(name, required, defaultValue);
    return value;
  }
}

class ServerConfigClass extends Schema {
  validate(data) {
    super.validate(data);
    this.isInteger("http_port", true, 3000, 1000, 65000);
    this.isString("db_url", true, undefined, 1, 255);
    this.isString("log_table_name", true, undefined, 1, 255);
    this.isInteger("log_expiration_days", true, 30, 1, 90);
  }
}

module.exports = Schema;

const data = {};
const serverSchema = new ServerSchema();
serverSchema.validate(data);
if (!serverSchema.ok) {
  console.log("errors", serverSchema.errors);
}
