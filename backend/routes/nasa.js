const express = require("express");
const router = express.Router();
const nasaController = require("../controllers/nasaController");

// APOD routes
router.get("/apod", nasaController.getAPOD);
router.get("/apod/:date", nasaController.getAPODByDate);

// Mars Rover Photos routes
router.get("/mars/:rover/photos", nasaController.getMarsPhotos);
router.get("/mars/:rover/photos/:sol", nasaController.getMarsPhotosBySol);

// Near Earth Objects routes
router.get("/neo", nasaController.getNEO);

module.exports = router;
