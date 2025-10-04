// validateValue.js:

"use strict";

/**
 * Validates a value against a single schema rule.
 * @param {string} key
 * @param {*} value
 * @param {object} rule
 * @returns {string[]} list of validation errors (if any)
 */
function validateValue(key, value, rule) {
  const errors = [];

  if (
    rule.required &&
    (value === undefined || value === null || value === "")
  ) {
    errors.push(`Missing required value for "${key}"`);
    return errors;
  }

  if (value === undefined || value === null || value === "") {
    return [];
  }

  switch (rule.type) {
    case "integer":
      if (typeof value !== "number" || !Number.isInteger(value)) {
        errors.push(`"${key}" must be an integer`);
      }
      if (rule.min != null && value < rule.min) {
        errors.push(`"${key}" must be >= ${rule.min}`);
      }
      if (rule.max != null && value > rule.max) {
        errors.push(`"${key}" must be <= ${rule.max}`);
      }
      break;

    case "float":
      if (typeof value !== "number") {
        errors.push(`"${key}" must be a float`);
      }
      if (rule.min != null && value < rule.min) {
        errors.push(`"${key}" must be >= ${rule.min}`);
      }
      if (rule.max != null && value > rule.max) {
        errors.push(`"${key}" must be <= ${rule.max}`);
      }
      break;

    case "boolean":
      if (typeof value !== "boolean") {
        errors.push(`"${key}" must be a boolean`);
      }
      break;

    case "string":
      if (typeof value !== "string") {
        errors.push(`"${key}" must be a string`);
      } else {
        if (rule.lowercase && value !== value.toLowerCase()) {
          errors.push(`"${key}" must be lowercase`);
        }
        if (rule.uppercase && value !== value.toUpperCase()) {
          errors.push(`"${key}" must be uppercase`);
        }
        if (rule.min != null && value.length < rule.min) {
          errors.push(`"${key}" must be at least ${rule.min} characters`);
        }
        if (rule.max != null && value.length > rule.max) {
          errors.push(`"${key}" must be at most ${rule.max} characters`);
        }
      }
      break;

    case "date":
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push(`"${key}" must be a valid date`);
      }
      break;

    case "time":
      if (!/^\d{2}:\d{2}$/.test(value)) {
        errors.push(`"${key}" must be in HH:mm format`);
      } else {
        const [h, m] = value.split(":").map(Number);
        if (h < 0 || h > 23 || m < 0 || m > 59) {
          errors.push(`"${key}" has invalid hour or minute`);
        }
      }
      break;

    case "array":
      if (!Array.isArray(value)) {
        errors.push(`"${key}" must be an array`);
      }
      break;

    case "object":
      if (typeof value !== "object" || Array.isArray(value)) {
        errors.push(`"${key}" must be an object`);
      }
      break;

    default:
      errors.push(`Unknown type "${rule.type}" for "${key}"`);
  }

  return errors;
}

module.exports = validateValue;
