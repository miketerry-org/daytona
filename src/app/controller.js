// src/app/controller.js

"use strict";

// Load base class and environment utility
const Base = require("./base");
const { isProduction } = require("../lib/environment");

/**
 * Abstract base Controller for Express route handlers.
 * Encapsulates request/response, provides RESTful method stubs,
 * and inherits shared utilities from Base (logging, error throwing, etc).
 */
class Controller extends Base {
  #req;
  #res;

  /**
   * Create a controller instance bound to a request/response pair.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  constructor(req, res) {
    super();

    if (!req || !res) {
      this.throwError("Controller requires both req and res objects.");
    }

    this.#req = req;
    this.#res = res;
  }

  // ======== Request / Response Accessors ========

  /** @returns {import("express").Request} */
  get request() {
    return this.#req;
  }

  /** @returns {import("express").Response} */
  get response() {
    return this.#res;
  }

  /** @returns {string} HTTP method, e.g., "GET" */
  get method() {
    return this.#req.method;
  }

  /** @returns {string} Path of the request (after domain) */
  get path() {
    return this.#req.path;
  }

  /** @returns {object} Route parameters from URL */
  get params() {
    return this.#req.params;
  }

  /** @returns {object} Query string parameters */
  get query() {
    return this.#req.query;
  }

  /** @returns {any} Request body */
  get body() {
    return this.#req.body;
  }

  /** @returns {object} Request headers */
  get headers() {
    return this.#req.headers;
  }

  /** @returns {string} IP address of the client */
  get ip() {
    return this.#req.ip;
  }

  /** @returns {string} The `Content-Type` header (lowercased), or empty string */
  get contentType() {
    return (this.#req.headers["content-type"] || "").toLowerCase();
  }

  /** @returns {boolean} Whether the client expects JSON response */
  get expectJSON() {
    return this.#req.accepts(["json", "html"]) === "json";
  }

  /** @returns {boolean} Whether the client expects HTML response */
  get expectHTML() {
    return this.#req.accepts(["html", "json"]) === "html";
  }

  // ======== RESTful Method Stubs ========

  /** GET /resources */
  async index() {
    this.notImplemented();
  }

  /** GET /resources/new */
  async new() {
    this.notImplemented();
  }

  /** POST /resources */
  async create() {
    this.notImplemented();
  }

  /** GET /resources/:id */
  async show() {
    this.notImplemented();
  }

  /** GET /resources/:id/edit */
  async edit() {
    this.notImplemented();
  }

  /** PATCH or PUT /resources/:id */
  async update() {
    this.notImplemented();
  }

  /** DELETE /resources/:id */
  async destroy() {
    this.notImplemented();
  }

  /**
   * Default fallback for unimplemented controller methods.
   * - Returns different formats depending on client `Accept` header.
   * - Status code:
   *   - 501 in development (to indicate incomplete implementation)
   *   - 404 in production (to not expose internal structure)
   */
  notImplemented() {
    const statusCode = isProduction ? 404 : 501;
    const message = `Not Implemented: ${this.method} ${this.path}`;

    this.logger.warn(`Unimplemented route: ${this.method} ${this.path}`);

    if (this.expectJSON) {
      return this.response
        .status(statusCode)
        .json({ status: statusCode, message });
    }

    if (this.expectHTML) {
      // You can customize or override this template later
      return this.response.status(statusCode).render("error/not-implemented", {
        status: statusCode,
        message,
        method: this.method,
        path: this.path,
      });
    }

    // Fallback: plain text
    return this.response.status(statusCode).send(message);
  }

  /**
   * Wrap async logic in a try/catch block for consistent error handling.
   *
   * @param {Function} callback - An async function containing the controller logic.
   * @returns {Promise<void>}
   */
  async tryCatch(callback) {
    try {
      await callback();
    } catch (err) {
      this.logger.error("Unhandled controller error", {
        error: err.message,
        stack: err.stack,
        method: this.method,
        path: this.path,
      });

      if (this.expectJSON) {
        this.response.status(500).json({
          status: 500,
          message: "Internal Server Error",
        });
      } else if (this.expectHTML) {
        this.response.status(500).render("error/500", {
          status: 500,
          message: "An unexpected error occurred.",
        });
      } else {
        this.response.status(500).send("Internal Server Error");
      }
    }
  }
}

module.exports = Controller;
