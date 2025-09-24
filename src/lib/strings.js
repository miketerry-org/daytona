// strings.js:

"use strict";

/**
 * Utility class for working with strings and templates.
 */
class Strings {
  /**
   * Expands a simple template string by replacing placeholders of the form `${key}`
   * with their corresponding values from the `values` object.
   *
   * The placeholder syntax uses `${…}`. For each placeholder:
   * - If `values[key]` is defined (not `undefined`), it replaces `${key}` with that value.
   * - Otherwise, it leaves the placeholder unchanged (i.e. `${key}` remains in the output).
   *
   * Note: This is a simple implementation and does not support nested expressions, arbitrary code execution, or escaping.
   *
   * @param {string} template - The template string containing placeholders like `${key}`.
   * @param {Object.<string, *>} values - An object whose keys correspond to placeholder names.
   *   The values can be of any type; they will be coerced to string when inserted.
   * @returns {string} The resulting string with substitutions applied.
   *
   * @example
   * Strings.expand("Hello, ${name}!", { name: "Alice" });
   * // returns "Hello, Alice!"
   *
   * @example
   * // If a key is missing, the placeholder is left as is:
   * Strings.expand("X = ${x}, Y = ${y}", { x: 10 });
   * // returns "X = 10, Y = ${y}"
   */
  static expand(template, values) {
    return template.replace(/\${([^}]+)}/g, (match, p1) => {
      return values[p1] !== undefined ? values[p1] : match;
    });
  }
}

module.exports = Strings;
