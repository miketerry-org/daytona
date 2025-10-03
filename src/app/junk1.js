
  addError(name, message) {
    this.errors.push({ name, message });
    return null;
  }

  reset(data) {
    this.#data = data;
    this.#errors = [];
  }

  validate(data) {
    this.reset(data);
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
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._checkType(["array"]);
    this._checkRange(min, max);
    return this.#value;
  }

  isBoolean(name, required, defaultValue) {
    this._checkname(name);
    this._checkRequired(required, defaultValue);
    this.parseBoolean();
    this._checkType(["boolean"]);
    return this.#value;
  }

  isDate(name, required, defaultValue, min, max) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this.parseDate();
    this._checkType(["date"]);
    this._checkRange(min, max);
    return this.#value;
  }

  isDuplicate(name, duplicateName) {
    this._checkName(name);
  }

  isEmail(name, required, defaultValue) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._checkType(["string"]);
    this._checkLength(5, 255);
    this._checkRegEx(EMAIL_REGEX);
    return this.#value;
  }

  isEnum(name, required, defaultValue, validValues) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._checkType(["string", defaultValue]);
    this._checkInArray(validValues);
    return this.#value;
  }

  isFloat(name, required, defaultValue, min, max) {
    this._checkname(name);
    this._checkRequired(required, defaultValue);
    this.convertToFloat();
    this._checkType(["float", "integer", "number"]);
    this._checkRange(min, max);
    return this.#value;
  }

  isInteger(name, required, defaultValue, min, max) {
    this._checkname(name);
    this._checkRequired(required, defaultValue);
    this.convertToInteger();
    this._checkRange(min, max);
    return this.#value;
  }

  isNumber(name, required, defaultValue, min, max) {
    this._checkname(name);
    this._checkRequired(required, defaultValue);
    this.convertToFloat();
    this._checkRange(min, max);
    return this.#value;
  }

  isPassword(name, required, defaultValue) {
    const passwordRegEx =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{12,}$/;
    return this.isRegEx(name, required, defaultValue, 12, 64, passwordRegEx);
  }

  isMatch(name, required, defaultValue, expression) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._checkMatch(expression);
    return this.#value;
  }

  isString(name, required, defaultValue, min, max) {
    this._checkname(name);
    this._checkRequired(required, defaultValue);
    this._checkType(["string"]);
    this._checkLength(min, max);
    return this.#value;
  }

  isTime(name, required, defaultValue) {
    this._checkname(name);
    this._checkRequired(required, defaultValue);
    this.convertToTime();
    this._checkType("time");
    return this.#value;
  }

  isTimestamp(name, required, defaultValue) {
    this._checkname(name);
    this._checkRequired(required, defaultValue);
    this.convertToTimestamp();
    this._checkType("time");
    return this.#value;
  }
}

module.exports = Schema;
