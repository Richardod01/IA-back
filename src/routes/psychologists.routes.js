const express = require('express');
const routes = express.Router();

const { getPsychologist, getPsychologistById, createPsychologists, updatePsychologists, deletePsychologists } = require("../controllers/psychologists.controller.js");

routes.get("/all", getPsychologist);
routes.get("/getOne/:id_psicologo", getPsychologistById);
routes.post("/add", createPsychologists);
routes.put("/update/:id_psicologo", updatePsychologists);
routes.delete("/delete/:id_psicologo", deletePsychologists);

module.exports = routes;