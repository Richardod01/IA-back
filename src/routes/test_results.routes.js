const express = require("express");
const { addResult, getAllResults } = require("../controllers/test_results.controller");
const isAuthenticated = require("../middlewares/auth.middleware");
const routes = express.Router();
routes.post("/add", isAuthenticated, addResult);
routes.get("/onePatient/:id", isAuthenticated, getAllResults);
module.exports = routes;