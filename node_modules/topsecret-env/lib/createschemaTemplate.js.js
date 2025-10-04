// createSchemaTemplate.js:

"use strict";

/**
 * Infers a validation schema from the properties of a given object.
 *
 * This is useful for generating a starting point for an environment schema file.
 * The function attempts to infer types such as string, integer, float, boolean,
 * array, object, date, and time (HH:MM format) based on the values in the object.
 *
 * @param {object} object - The source configuration object to analyze.
 * @returns {Array<object>} schema - An array of schema entries describing each property.
 *
 * @example
 * const config = {
 *   port: 3000,
 *   debug: true,
 *   roles: ["admin", "user"],
 *   site: { title: "MyApp" },
 *   launchTime: "14:00"
 * };
 *
 * const schema = createSchemaTemplate(config);
 * console.log(schema);
 * // [
 * //   { name: "port", type: "integer", required: false },
 * //   { name: "debug", type: "boolean", required: false },
 * //   { name: "roles", type: "array", required: false },
 * //   { name: "site", type: "object", required: false },
 * //   { name: "launchTime", type: "time", required: false }
 * // ]
 */
function createSchemaTemplate(object) {
  if (!object || typeof object !== "object" || Array.isArray(object)) {
    throw new TypeError("Expected a plain object as input");
  }

  const schema = [];

  for (const [key, value] of Object.entries(object)) {
    let type = "string"; // Default fallback

    if (typeof value === "boolean") {
      type = "boolean";
    } else if (typeof value === "number") {
      type = Number.isInteger(value) ? "integer" : "float";
    } else if (typeof value === "string") {
      if (/^\d{2}:\d{2}$/.test(value)) {
        type = "time";
      } else if (!isNaN(Date.parse(value))) {
        type = "date";
      } else {
        type = "string";
      }
    } else if (Array.isArray(value)) {
      type = "array";
    } else if (typeof value === "object" && value !== null) {
      type = "object";
    }

    schema.push({
      name: key,
      type,
      required: false, // default assumption; user should adjust
    });
  }

  return schema;
}

module.exports = createSchemaTemplate;
