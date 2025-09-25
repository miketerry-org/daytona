// src/app/application.js

"use strict";

const path = require("path");
const express = require("express");
const findFiles = require("../utils/findFiles");

/**
 * Application wrapper around Express.
 * Encapsulates setup, configuration, middleware, and route registration.
 */
class Application {
  #app;

  constructor() {
    this.#app = express();

    // Apply built-in middlewares
    this.#app.use(express.json()); // For JSON request bodies
    this.#app.use(express.urlencoded({ extended: true })); // For form submissions
  }

  /**
   * Registers a router by binding controller class methods to REST routes under basePath.
   * @param {string} basePath - The base URL path (e.g. "/users")
   * @param {class} ControllerClass - Controller class to instantiate per request
   */
  #addRouter(basePath, ControllerClass) {
    if (typeof basePath !== "string" || !basePath.startsWith("/")) {
      throw new TypeError("basePath must be a string starting with '/'");
    }
    if (typeof ControllerClass !== "function") {
      throw new TypeError("ControllerClass must be a constructor function");
    }

    const router = express.Router();

    // Uniform route definitions mapping RESTful controller methods to HTTP verbs and paths
    const routes = [
      { method: "get", path: "/", action: "index" },
      { method: "get", path: "/new", action: "new" },
      { method: "post", path: "/", action: "create" },
      { method: "get", path: "/:id", action: "show" },
      { method: "get", path: "/:id/edit", action: "edit" },
      { method: "put", path: "/:id", action: "update" },
      { method: "patch", path: "/:id", action: "update" },
      { method: "delete", path: "/:id", action: "destroy" },
    ];

    for (const { method, path: routePath, action } of routes) {
      // Wrap each route handler to instantiate controller and call the method with tryCatch
      router[method](routePath, (req, res) => {
        const controller = new ControllerClass(req, res);

        // Only call the method if it exists, else fallback to notImplemented
        const handler =
          controller[action]?.bind(controller) ||
          controller.notImplemented.bind(controller);

        // Wrap in tryCatch for error handling
        return controller.tryCatch(() => handler());
      });
    }

    // Mount router under the basePath
    this.#app.use(basePath, router);
  }

  /**
   * Private helper: derives the base path from a feature folder path.
   * E.g., src/features/users/userController.js -> /users
   * @param {string} filePath - Absolute path to the controller file
   * @returns {string} basePath like "/users"
   */
  #deriveBasePath(filePath) {
    // Normalize and split path
    const normalized = path.normalize(filePath);
    const parts = normalized.split(path.sep);

    // Find "features" folder index
    const featuresIndex = parts.findIndex(
      part => part.toLowerCase() === "features"
    );
    if (featuresIndex === -1 || featuresIndex + 1 >= parts.length) {
      throw new Error(`Cannot derive base path from ${filePath}`);
    }

    // Next folder after "features" is resource folder, use it as base path
    const resourceName = parts[featuresIndex + 1];
    return `/${resourceName.toLowerCase()}`;
  }

  /**
   * Private helper: Checks if filename ends with Controller.js (case-insensitive)
   * @param {string} filename
   * @returns {boolean}
   */
  #isControllerFile(filename) {
    return /Controller\.js$/i.test(filename);
  }

  /**
   * Private helper: Dynamically requires a controller module, expecting export of a class.
   * Throws error if invalid.
   * @param {string} filePath
   * @returns {class} ControllerClass
   */
  #loadControllerClass(filePath) {
    const mod = require(filePath);

    // Accept default export or named export that is a function (class)
    const ControllerClass = mod.default || mod;

    if (typeof ControllerClass !== "function") {
      throw new TypeError(
        `Controller module at ${filePath} does not export a class`
      );
    }

    return ControllerClass;
  }

  /**
   * Private method: scans ./src/features for all *Controller.js files and registers routers automatically.
   */
  async #defineControllers() {
    const featureDir = path.resolve(__dirname, "../features");

    const allFiles = findFiles("*.js", featureDir);

    for (const filePath of allFiles) {
      if (!this.#isControllerFile(path.basename(filePath))) {
        continue;
      }

      try {
        const ControllerClass = this.#loadControllerClass(filePath);
        const basePath = this.#deriveBasePath(filePath);

        this.addRouter(basePath, ControllerClass);
        // Optional: could log successful router registration
        console.log(
          `Mounted controller ${ControllerClass.name} on ${basePath}`
        );
      } catch (err) {
        console.error(
          `Failed to load controller from ${filePath}: ${err.message}`
        );
      }
    }
  }

  /**
   * Public method to initialize application and automatically define all controllers/routes.
   * Must be called before listen()
   */
  async initialize() {
    await this.#defineControllers();
  }

  /**
   * Register global error handler middleware.
   * Must be defined after all routes.
   *
   * @param {Function} errorHandler - Express-compatible error handler
   */
  addErrorHandler(errorHandler) {
    if (typeof errorHandler !== "function") {
      throw new TypeError("Error handler must be a function");
    }

    this.#app.use(errorHandler);
  }

  /**
   * Start the HTTP server on the specified port.
   *
   * @param {number} port - Port number to listen on
   * @param {Function} [callback] - Optional callback on server start
   */
  listen(port, callback) {
    this.#app.listen(port, callback);
  }
}

module.exports = Application;
