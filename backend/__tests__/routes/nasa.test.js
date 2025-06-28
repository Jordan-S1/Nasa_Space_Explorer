const request = require("supertest");
const express = require("express");
const nasaRoutes = require("../../routes/nasa");
const errorHandler = require("../../middleware/errorHandler");

// Mock the controller
jest.mock("../../controllers/nasaController");
const nasaController = require("../../controllers/nasaController");

const app = express();
app.use(express.json());
app.use("/api/nasa", nasaRoutes);
app.use(errorHandler);

// Nasa Routes Tests
describe("NASA Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // APOD Routes Tests
  describe("GET /api/nasa/apod", () => {
    it("should call getAPOD controller", async () => {
      nasaController.getAPOD.mockImplementation((req, res) => {
        res.json({ title: "Test APOD" });
      });

      const response = await request(app).get("/api/nasa/apod").expect(200);

      expect(nasaController.getAPOD).toHaveBeenCalled();
      expect(response.body).toEqual({ title: "Test APOD" });
    });

    it("should pass query parameters to controller", async () => {
      nasaController.getAPOD.mockImplementation((req, res) => {
        res.json({ date: req.query.date });
      });

      await request(app).get("/api/nasa/apod?date=2024-01-01").expect(200);

      expect(nasaController.getAPOD).toHaveBeenCalled();
    });
  });

  // Download Image Tests
  describe("GET /api/nasa/download-image", () => {
    it("should call downloadImage controller", async () => {
      nasaController.downloadImage.mockImplementation((req, res) => {
        res.json({ message: "Image downloaded" });
      });

      await request(app)
        .get("/api/nasa/download-image?imageUrl=https://example.com/image.jpg")
        .expect(200);

      expect(nasaController.downloadImage).toHaveBeenCalled();
    });
  });

  // Mars Rover Photos Tests
  describe("GET /api/nasa/mars/:rover/photos", () => {
    it("should call getMarsPhotos controller with rover parameter", async () => {
      nasaController.getMarsPhotos.mockImplementation((req, res) => {
        res.json({ rover: req.params.rover });
      });

      const response = await request(app)
        .get("/api/nasa/mars/curiosity/photos")
        .expect(200);

      expect(nasaController.getMarsPhotos).toHaveBeenCalled();
      expect(response.body).toEqual({ rover: "curiosity" });
    });
  });

  // Near Earth Objects Tests
  describe("GET /api/nasa/neo", () => {
    it("should call getNearEarthObjects controller", async () => {
      nasaController.getNearEarthObjects.mockImplementation((req, res) => {
        res.json({ message: "NEO data" });
      });

      await request(app)
        .get("/api/nasa/neo?start_date=2024-01-01&end_date=2024-01-07")
        .expect(200);

      expect(nasaController.getNearEarthObjects).toHaveBeenCalled();
    });
  });
});
