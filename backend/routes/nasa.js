const express = require("express");
const router = express.Router();
const nasaController = require("../controllers/nasaController");

// APOD routes
router.get("/apod", nasaController.getAPOD);
// Get APOD by date
router.get("/apod/:date", nasaController.getAPODByDate);
// Download Image route
router.get("/download-image", nasaController.downloadImage);

// Mars Rover Photos routes
router.get("/mars/:rover/photos", nasaController.getMarsPhotos);

// Near Earth Objects routes
router.get("/neo", nasaController.getNearEarthObjects);

module.exports = router;
