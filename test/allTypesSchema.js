//

const msg = {
  isRequired: `"${name}" is required!`,
  isArray: `"${name}" must be an "array"`,
  isBoolean: `"${name}" must be a "boolean" value`,
  minLength: `"${name} must have a length of atleast ${min}`,
  maxLength: `"${name} must have a length of no more then ${max}`,
};

class Schema extends Base {
  #data = undefined;
  #errors = [];
  #name;
  #value;
  #valueOK;

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
    this.#data = data;
  }

  get errors() {
    return this.#errors;
  }

  get dataOK() {
    return this.#errors.length === 0;
  }

  get valueOK() {
    return this.#valueOK;
  }

  isArray(name, required, defaultValue, min, max) {
    this.chechkName(name);
    this.checkRequired(required, defaultValue);
    this.checkType(["array"]);
    this.checkRange(min, max);
    return this.#value;
  }

  isBoolean(name, required, defaultValue) {
    this.checkname(name);
    this.checkRequired(required, defaultValue);
    this.parseBoolean();
    this.checkType(["boolean"]);
    return this.#value;
  }

  isDate(name, required, defaultValue, min, max) {
    this.chechkName(name);
    this.checkRequired(required, defaultValue);
    this.parseDate();
    this.checkType(["date"]);
    this.checkRange(min, max);
    return this.#value;
  }

  isDuplicate(name, duplicateName) {}

  isEmail(name, required, defaultValue) {
    this.chechkName(name);
    this.checkRequired(required, defaultValue);
    this.checkType(["string"]);
    this.checkLength(5, 255);
    this.checkRegEx(""); //!!mike, need to get regular expression for email address
    return this.#value;
  }

  isEnum(name, required, defaultValue, validValues) {
    this.chechkName(name);
    this.checkRequired(required, defaultValue);
    this.checkType(["string", defaultValue]);
    this.checkInArray(validValues);
    return this.#value;
  }

  isFloat(name, required, defaultValue, min, max) {
    this.checkname(name);
    this.checkRequired(required, defaultValue);
    this.parseFloat();
    this.checkType(["float", "integer", "number"]);
    this.checkRange(min, max);
    return this.#value;
  }

  isInteger(name, required, defaultValue, min, max) {
    this.checkname(name);
    this.checkRequired(required, defaultValue);
    this.parseInteger();
    this.checkRange(min, max);
    return this.#value;
  }

  isNumber(name, required, defaultValue, min, max) {
    this.checkname(name);
    this.checkRequired(required, defaultValue);
    this.parseFloat();
    this.checkRange(min, max);
    return this.#value;
  }

  isPassword(name, required, defaultValue) {
    const passwordRegEx =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{12,}$/;
    return this.isRegEx(name, required, defaultValue, 12, 64, passwordRegEx);
  }

  isMatch(name, required, defaultValue, expression) {
    this.chechkName(name);
    this.checkRequired(required, defaultValue);
    this.checkMatch(expression);
    return this.#value;
  }

  isString(name, required, defaultValue, min, max) {
    this.checkname(name);
    this.checkRequired(required, defaultValue);
    this.checkType(["string"]);
    this.checkLength(min, max);
    return this.#value;
  }

  isTime(name, required, defaultValue) {
    this.checkname(name);
    this.checkRequired(required, defaultValue);
    this.parseTime();
    this.checkType("time");
    return this.#value;
  }

  isTimestamp(name, required, defaultValue) {
    this.checkname(name);
    this.checkRequired(required, defaultValue);
    this.parseTimestamp();
    this.checkType("time");
    return this.#value;
  }
}

class ServerConfigSchemaClass extends Schema {
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
