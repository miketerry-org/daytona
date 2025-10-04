// schema.js:
//
"use strict";

// load all necessary modules
const Base = require("./base");

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
/**
 * Regex for password that requires:
 * - at least one uppercase letter
 * - at least one lowercase letter
 * - at least one digit
 * - at least one special symbol (non-alphanumeric)
 * - minimum length 12
 */
const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{12,}$/;

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

  expectBoolean(name, required, defaultValue) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._parseBoolean();
    this._checkType(["boolean"]);
  }

  expectDate(name, required, defaultValue, min, max) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._parseDate();
    this._checkType(["date"]);
    this._checkRange(min, max);
  }

  expectDuplicate(name, duplicateName) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this_checkDuplicate(duplicateName);
  }

  expectEmail(name, required, defaultValue) {
    this.expectMatch(name, required, defaultValue, EMAIL_REGEX);
  }

  expectEnum(name, required, defaultValue, validValues) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._checkType(["string"]);
    this._checkInArray(validValues);
  }

  expectFloat(name, required, defaultValue, min, max) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._parseFloat();
    this._checkType(["float"]);
    this._checkRange(min, max);
  }

  expectInteger(name, required, defaultValue, min, max) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._parseInteger();
    this._checkType(["integer"]);
    this._checkRange(min, max);
  }

  expectMatch(name, required, defaultValue, expression) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._checkType(["string"]);
    this._checkRegEx(expression);
  }

  expectNumber(name, required, defaultValue, min, max) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._parseNumber();
    this._checkType(["float", "integer", "number"]);
    this._checkRange(min, max);
  }

  expectPassword(name, required, defaultValue) {
    this.expectMatch(name, required, defaultValue, password_regex);
  }

  expectString(name, required, defaultValue, min, max, capitalize) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._capitalize(capitalize);
    this._checkType(["string"]);
    this._checkLength(min, max);
  }

  expectTime(name, required, defaultValue) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._parseTime();
    this._checkType(["string"]);
  }

  expectTimestamp(name, required, defaultValue) {
    this._checkName(name);
    this._checkRequired(required, defaultValue);
    this._parseTimestamp();
    this._checkType(["string"]);
  }

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

  /**
   * Applies a specific capitalization format to the current property value if it is a string.
   *
   * Supported modes:
   * - "none": Do not alter the value.
   * - "upper": Convert the entire string to uppercase.
   * - "lower": Convert the entire string to lowercase.
   * - "firstcap": Capitalize only the first character, leave the rest unchanged.
   * - "title": Capitalize the first letter of each word.
   * - "sentence": Capitalize only the first letter of the first sentence.
   * - "camel": Convert to camelCase.
   * - "pascal": Convert to PascalCase.
   * - "snake": Convert to snake_case (lowercase with underscores).
   * - "kebab": Convert to kebab-case (lowercase with hyphens).
   *
   * If the value is not a string or is empty, this method does nothing.
   *
   * @param {string} capitalize - The capitalization format to apply.
   */
  _capitalize(capitalize) {
    if (!capitalize || typeof capitalize !== "string") {
      return;
    }

    let value = this.#value;

    if (typeof value !== "string" || value.length === 0) {
      return;
    }

    // Helper: Title case each word
    const toTitleCase = str =>
      str.replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
      );

    // Helper: Sentence case
    const toSentenceCase = str => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Helper: camelCase
    const toCamelCase = str => {
      return str
        .toLowerCase()
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
    };

    // Helper: PascalCase
    const toPascalCase = str => {
      const camel = toCamelCase(str);
      return camel.charAt(0).toUpperCase() + camel.slice(1);
    };

    // Helper: snake_case
    const toSnakeCase = str => {
      return str
        .replace(/\s+/g, "_")
        .replace(/[A-Z]/g, c => "_" + c.toLowerCase())
        .replace(/^-/, "")
        .toLowerCase();
    };

    // Helper: kebab-case
    const toKebabCase = str => {
      return str
        .replace(/\s+/g, "-")
        .replace(/[A-Z]/g, c => "-" + c.toLowerCase())
        .replace(/^-/, "")
        .toLowerCase();
    };

    let result;

    switch (capitalize.toLowerCase()) {
      case "upper":
        result = value.toUpperCase();
        break;
      case "lower":
        result = value.toLowerCase();
        break;
      case "firstcap":
        result = value.charAt(0).toUpperCase() + value.slice(1);
        break;
      case "title":
        result = toTitleCase(value);
        break;
      case "sentence":
        result = toSentenceCase(value);
        break;
      case "camel":
        result = toCamelCase(value);
        break;
      case "pascal":
        result = toPascalCase(value);
        break;
      case "snake":
        result = toSnakeCase(value);
        break;
      case "kebab":
        result = toKebabCase(value);
        break;
      case "none":
      default:
        return; // Do nothing
    }

    // Assign transformed value to internal state and original data
    this.#value = result;
    this.#data[this.#name] = result;
  }

  /**
   * Parses the current property value into a boolean if it matches
   * known truthy or falsy values. Otherwise, logs an error.
   *
   * Truthy values (case-insensitive): true, "true", 1, "1", "y", "yes", "on"
   * Falsy values (case-insensitive): false, "false", 0, "0", "n", "no", "off"
   *
   * On successful parse, updates both internal and original data value.
   * If parsing fails, records a validation error.
   */
  _parseBoolean() {
    const trueValues = ["true", "1", "y", "yes", "on"];
    const falseValues = ["false", "0", "n", "no", "off"];

    let value = this.#value;
    let parsed = undefined;

    if (typeof value === "boolean") {
      return; // already valid
    }

    if (typeof value === "number") {
      if (value === 1) parsed = true;
      else if (value === 0) parsed = false;
    } else if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (trueValues.includes(normalized)) parsed = true;
      else if (falseValues.includes(normalized)) parsed = false;
    }

    if (typeof parsed === "boolean") {
      this.#value = parsed;
      this.#data[this.#name] = parsed;
    } else {
      this._addError(
        `"${this.#name}" is "${parsed}" which is not a valid boolean value.`
      );
    }
  }

  /**
   * Parses the current field value into a Date or timestamp, based on the conversion mode.
   *
   * This method handles various date formats and conversion strategies.
   * It updates both the internal value and the original data object.
   * If parsing fails, a validation error is added.
   *
   * Supported `convert` modes:
   * - "none": Do not modify the value.
   * - "date": Parse as date-only (YYYY-MM-DD), interpreted in local time.
   * - "utc": Parse ISO datetime and normalize to UTC.
   * - "local": Parse ISO datetime in server-local time.
   * - "timestamp": Parse and convert to a Unix timestamp (in milliseconds).
   * - "zoned": Reserved for future support (e.g., timezones like "America/New_York").
   *
   * @param {string} convert - Conversion strategy for the date field.
   */
  _parseDate(convert = "date") {
    const raw = this.#value;
    let parsed = null;

    if (convert === "none") {
      return;
    }

    if (
      typeof raw !== "string" &&
      typeof raw !== "number" &&
      !(raw instanceof Date)
    ) {
      this._addError(`"${this.#name}" must be a valid date value.`);
      return;
    }

    try {
      switch (convert) {
        case "date":
          if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            parsed = new Date(`${raw}T00:00:00`);
          } else {
            parsed = new Date(raw);
          }
          break;

        case "utc":
        case "local":
          parsed = new Date(raw);
          break;

        case "timestamp":
          parsed = new Date(raw);
          if (!isNaN(parsed)) {
            parsed = parsed.getTime();
          }
          break;

        case "zoned":
          this._addError(
            `"${
              this.#name
            }" uses unsupported convert mode "zoned" (not yet implemented).`
          );
          return;

        default:
          this._addError(
            `"${this.#name}" has unknown date conversion mode: "${convert}".`
          );
          return;
      }

      if (!parsed || isNaN(parsed)) {
        this._addError(`"${this.#name}" must be a valid date.`);
        return;
      }

      this.#value = parsed;
      this.#data[this.#name] = parsed;
    } catch (err) {
      this._addError(`"${this.#name}" could not be parsed as a valid date.`);
    }
  }

  /**
   * Parses the current field value as a floating-point number.
   *
   * Accepts strings or numbers and attempts to coerce them into a valid float.
   * On success, updates the internal value and original data. On failure,
   * logs a validation error using `_addError()`.
   *
   * Examples of accepted inputs:
   *   - "3.14"
   *   - " -0.01 "
   *   - 5.0
   *
   * Invalid inputs (which trigger errors):
   *   - "abc"
   *   - true
   *   - null
   *   - NaN
   */
  _parseFloat() {
    const raw = this.#value;

    if (typeof raw === "number" && Number.isFinite(raw)) {
      // Already a valid float
      return;
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      const parsed = parseFloat(trimmed);

      if (!isNaN(parsed) && Number.isFinite(parsed)) {
        this.#value = parsed;
        this.#data[this.#name] = parsed;
        return;
      }
    }

    // If we got here, parsing failed
    this._addError(`"${this.#name}" must be a valid floating-point number.`);
  }

  /**
   * Parses the current field value as an integer.
   *
   * Accepts strings or numbers and attempts to coerce them into a valid integer.
   * If the input is a valid integer (finite, no decimal part), it updates the
   * internal value and original data. Otherwise, logs a validation error.
   *
   * Examples of accepted inputs:
   *   - "42"
   *   - " -10 "
   *   - 0
   *
   * Invalid inputs (which trigger errors):
   *   - "3.14"
   *   - 100.5
   *   - "abc"
   *   - NaN
   *   - null
   */
  _parseInteger() {
    const raw = this.#value;

    if (typeof raw === "number" && Number.isInteger(raw)) {
      return; // Already a valid integer
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      const parsed = parseInt(trimmed, 10);

      // Ensure it's a valid number and not a float disguised as int
      if (
        (!isNaN(parsed) &&
          Number.isFinite(parsed) &&
          String(parsed) === trimmed) ||
        String(parsed) === trimmed.replace(/^0+/, "0")
      ) {
        if (parseFloat(trimmed) === parsed) {
          this.#value = parsed;
          this.#data[this.#name] = parsed;
          return;
        }
      }
    }

    this._addError(`"${this.#name}" must be a valid integer.`);
  }

  /**
   * Parses the current field value as a numeric value (integer or float).
   *
   * Accepts both strings and numbers. If the value can be coerced into a valid
   * number (finite, not NaN), it is parsed and saved into the internal value and
   * the original data. Otherwise, a validation error is recorded.
   *
   * This parser is more permissive than `_parseInteger()` or `_parseFloat()` and
   * allows both integer and decimal formats.
   *
   * Examples of accepted inputs:
   *   - "3.14"
   *   - "-42"
   *   - " 0 "
   *   - 99.99
   *
   * Invalid inputs (which trigger errors):
   *   - "abc"
   *   - "12abc"
   *   - NaN
   *   - true
   *   - null
   */
  _parseNumber() {
    const raw = this.#value;

    if (typeof raw === "number" && Number.isFinite(raw)) {
      return; // Already a valid number
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      const parsed = Number(trimmed);

      if (!isNaN(parsed) && Number.isFinite(parsed)) {
        this.#value = parsed;
        this.#data[this.#name] = parsed;
        return;
      }
    }

    this._addError(`"${this.#name}" must be a valid number.`);
  }

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
