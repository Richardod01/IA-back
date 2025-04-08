const express = require('express');
const routes = express.Router();
const { isAuthenticated } = require("../middlewares/auth.middleware.js");
const {
    createPatient,
    getPatients,
    getPatientsbyDoctor,
    getPatient,
    updatePatient,
    deletePatient,
    login,
    isLogin
} = require("../controllers/patients.controller.js");

routes.post("/create", createPatient);
routes.post("/login", login);
routes.post("/isLogin", isLogin)
routes.get("/all", getPatients);
routes.get("/getByDoctor/:id_doctor", getPatientsbyDoctor);
routes.get("/getOne/:id_patient", getPatient);
routes.put("/update/:id_patient", updatePatient);
routes.delete("/delete/:id_patient", deletePatient);

// routes.post("/login", login)

// routes.post("/islogin", isLogin)

module.exports = routes; 