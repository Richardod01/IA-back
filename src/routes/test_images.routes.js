const express = require("express")
const authenticated = require ("../middlewares/auth.middleware.js");
const { createImage, getImagesByTest, getImageByQuestion, updateImage } = require("../controllers/test_images.controller.js");
const routes = express.Router();
const multer = require("multer");
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 200 * 1024 * 1024 }, //Archivos solo de 60seg y 200mb
  });

routes.post("/add", upload.single("image"), createImage);
routes.get("/allTest/:id_test", getImagesByTest);
routes.get("/forQuestion/:id_test/:id_question", getImageByQuestion);
routes.put("/update/:id_test_image", updateImage);

module.exports = routes;