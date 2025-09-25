// src/utils/scanFiles.js

"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Scans the project directory for specific file types:
 * - "server" => ./env/server.secret
 * - "tenant" => ./env/tenants/*.secret
 * - "controller" => any file ending in "Controller.js"
 * - "model" => any file ending in "Model.js"
 *
 * @param {string} rootDir - The base directory to start the search. Usually project root.
 * @param {string[]} skipDirs - Folder names to skip (e.g., ["node_modules", ".git"]).
 * @returns {Array<{ type: string, path: string }>}
 */
function scanFiles(rootDir = process.cwd(), skipDirs = []) {
  const results = [];

  /**
   * Recursively walk the file tree
   * @param {string} currentDir
   */
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(rootDir, fullPath);
      const isSkipped = skipDirs.includes(entry.name);

      if (entry.isDirectory()) {
        if (!isSkipped) {
          walk(fullPath); // Recurse into subdirectories
        }
      } else if (entry.isFile()) {
        const filename = entry.name;

        // Match ./env/server.secret
        if (
          relativePath === path.join("env", "server.secret") ||
          relativePath === "env/server.secret"
        ) {
          results.push({ type: "server", path: fullPath });
        }

        // Match ./env/tenants/*.secret
        else if (
          relativePath.startsWith(path.join("env", "tenants") + path.sep) &&
          filename.endsWith(".secret")
        ) {
          results.push({ type: "tenant", path: fullPath });
        }

        // Match *Controller.js (case-insensitive)
        else if (/controller\.js$/i.test(filename)) {
          results.push({ type: "controller", path: fullPath });
        }

        // Match *Model.js (case-sensitive)
        else if (filename.endsWith("Model.js")) {
          results.push({ type: "model", path: fullPath });
        }
      }
    }
  }

  walk(rootDir);
  return results;
}

module.exports = scanFiles;
