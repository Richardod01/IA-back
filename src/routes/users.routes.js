const express = require('express');
const routes = express.Router();
const { isAuthenticated } = require("../middlewares/auth.middleware.js");
const {createUser,
    login,
    isLogin
} = require("../controllers/users.controller.js");

routes.post("/create", createUser)

routes.post("/login", login)

routes.post("/islogin", isLogin)

module.exports = routes;