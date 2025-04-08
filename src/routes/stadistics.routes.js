const express = require("express");
const router = express.Router();
const { evaluatePsychTest } = require("../controllers/psychTestController");
const routes = require("./users.routes");

// Ruta para evaluar el test psicológico
routes.post("/evaluate", evaluatePsychTest);

module.exports = routes;
