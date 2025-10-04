// src/routes/utils/bindController.js

function bindController(ControllerClass, methodName) {
  return async function handler(req, res, next) {
    const controller = new ControllerClass(req, res);
    if (typeof controller[methodName] !== "function") {
      return res.status(500).send(`Invalid controller method: ${methodName}`);
    }
    try {
      await controller[methodName](); // each method should call `tryCatch`
    } catch (err) {
      next(err); // fallback to Express error middleware
    }
  };
}

module.exports = bindController;
