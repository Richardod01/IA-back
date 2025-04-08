const express = require("express")
const authenticated = require ("../middlewares/auth.middleware.js");
const { createVideo, pruebaV, getVideosByTest, getVideoByQuestion, updateVideo } = require("../controllers/test_videos.controller.js");
const routes = express.Router();
const multer = require("multer");
const { updateImage } = require("../controllers/test_images.controller.js");
const upload = multer({
    dest: 'uploads/',
  });

routes.post("/add/:id_test/:id_question", upload.single("video"), createVideo);
routes.get("/allTests/:id_test", getVideosByTest);
routes.get("/forQuestion/:id_test/:id_question", getVideoByQuestion);
routes.put("/update/:id_test_video", updateVideo);


module.exports = routes;