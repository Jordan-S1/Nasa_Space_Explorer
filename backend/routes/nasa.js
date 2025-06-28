const express = require("express");
const router = express.Router();
const nasaController = require("../controllers/nasaController");

// APOD route
router.get("/apod", nasaController.getAPOD);
// Download Image route
router.get("/download-image", nasaController.downloadImage);

// Mars Rover Photos routes
router.get("/mars/:rover/photos", nasaController.getMarsPhotos);

// Near Earth Objects routes
router.get("/neo", nasaController.getNearEarthObjects);

module.exports = router;
