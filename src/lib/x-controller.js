// lib/controller.js

export default class Controller {
  #req;
  #res;
  #tenant;
  #models;

  constructor(req, res) {
    this.#req = req;
    this.#res = res;
    this.#tenant = req.tenant;
    this.#models = req.tenants.models;
  }

  get request() {
    return this.#req;
  }

  get response() {
    return this.#res;
  }

  /**
   * GET /resources
   */
  async index() {
    this.response.status(501).send("Not Implemented: index");
  }

  /**
   * GET /resources/new
   */
  async new() {
    this.response.status(501).send("Not Implemented: new");
  }

  /**
   * POST /resources
   */
  async create() {
    this.response.status(501).send("Not Implemented: create");
  }

  /**
   * GET /resources/:id
   */
  async show() {
    this.response.status(501).send("Not Implemented: show");
  }

  /**
   * GET /resources/:id/edit
   */
  async edit() {
    this.response.status(501).send("Not Implemented: edit");
  }

  /**
   * PATCH or PUT /resources/:id
   */
  async update() {
    this.response.status(501).send("Not Implemented: update");
  }

  /**
   * DELETE /resources/:id
   */
  async destroy() {
    this.response.status(501).send("Not Implemented: destroy");
  }
}

export default Controller
