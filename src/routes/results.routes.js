const express = require("express")
const authenticated = require ("../middlewares/auth.middleware.js");
const { createResultByPatient, createAvarageByPacient } = require("../controllers/results.controller.js");
const routes = express.Router();
routes.post("/result", createResultByPatient);
routes.post("/average", createAvarageByPacient);

module.exports = routes;