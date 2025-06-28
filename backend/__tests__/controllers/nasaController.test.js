const nasaController = require("../../controllers/nasaController");
const axios = require("axios");

// Mock axios
jest.mock("axios");
const mockedAxios = axios;

describe("NASA Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      pipe: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // APOD Tests
  describe("getAPOD", () => {
    it("should fetch APOD data successfully", async () => {
      const mockData = {
        title: "Test APOD",
        explanation: "Test explanation",
        url: "https://example.com/image.jpg",
        date: "2024-01-01",
      };

      mockedAxios.get.mockResolvedValue({ data: mockData });

      req.query = { date: "2024-01-01" };

      await nasaController.getAPOD(req, res, next);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.nasa.gov/planetary/apod",
        {
          params: {
            api_key: "test-api-key",
            date: "2024-01-01",
          },
        }
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle NASA API errors", async () => {
      const error = new Error("NASA API Error");
      mockedAxios.get.mockRejectedValue(error);

      await nasaController.getAPOD(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(
            "Failed to fetch data from NASA API"
          ),
        })
      );
    });

    it("should pass multiple query parameters", async () => {
      const mockData = [{ title: "APOD 1" }, { title: "APOD 2" }];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      req.query = {
        start_date: "2024-01-01",
        end_date: "2024-01-03",
        count: 2,
      };

      await nasaController.getAPOD(req, res, next);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.nasa.gov/planetary/apod",
        {
          params: {
            api_key: "test-api-key",
            start_date: "2024-01-01",
            end_date: "2024-01-03",
            count: 2,
          },
        }
      );
    });
  });

  // Download Image Tests
  describe("downloadImage", () => {
    it("should download image successfully", async () => {
      const mockStream = {
        pipe: jest.fn(),
      };
      const mockResponse = {
        data: mockStream,
        headers: {
          "content-type": "image/jpeg",
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);
      req.query = { imageUrl: "https://example.com/image.jpg" };

      await nasaController.downloadImage(req, res, next);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://example.com/image.jpg",
        { responseType: "stream" }
      );
      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "image/jpeg");
      expect(mockStream.pipe).toHaveBeenCalledWith(res);
    });

    it("should return error when imageUrl is missing", async () => {
      req.query = {};

      await nasaController.downloadImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Missing imageUrl query param",
      });
    });

    it("should handle download errors", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Download failed"));
      req.query = { imageUrl: "https://example.com/image.jpg" };

      await nasaController.downloadImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to download image",
      });
    });
  });

  // Mars Rover Photos Tests
  describe("getMarsPhotos", () => {
    it("should fetch Mars rover photos", async () => {
      const mockData = {
        photos: [
          { id: 1, img_src: "https://example.com/mars1.jpg" },
          { id: 2, img_src: "https://example.com/mars2.jpg" },
        ],
      };

      mockedAxios.get.mockResolvedValue({ data: mockData });

      req.params = { rover: "curiosity" };
      req.query = { sol: 1000, camera: "FHAZ" };

      await nasaController.getMarsPhotos(req, res, next);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos",
        {
          params: {
            api_key: "test-api-key",
            sol: 1000,
            camera: "FHAZ",
          },
        }
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("should handle Mars rover API errors", async () => {
      const error = new Error("Mars Rover API Error");
      mockedAxios.get.mockRejectedValue(error);

      req.params = { rover: "curiosity" };
      req.query = { sol: 1000 };

      await nasaController.getMarsPhotos(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Mars Rover API Error"),
        })
      );
    });
  });

  // Near Earth Objects Tests
  describe("getNearEarthObjects", () => {
    it("should fetch NEO data with valid date range", async () => {
      const mockData = {
        near_earth_objects: {
          "2024-01-01": [{ name: "Asteroid 1", estimated_diameter: {} }],
        },
      };

      mockedAxios.get.mockResolvedValue({ data: mockData });

      req.query = {
        start_date: "2024-01-01",
        end_date: "2024-01-07",
      };

      await nasaController.getNearEarthObjects(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("should return error when start_date is missing", async () => {
      req.query = { end_date: "2024-01-07" };

      await nasaController.getNearEarthObjects(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "start_date and end_date are required parameters",
      });
    });

    it("should return error when end_date is missing", async () => {
      req.query = { start_date: "2024-01-01" };

      await nasaController.getNearEarthObjects(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "start_date and end_date are required parameters",
      });
    });

    it("should handle NEO API errors", async () => {
      const error = new Error("NEO API Error");
      mockedAxios.get.mockRejectedValue(error);

      req.query = {
        start_date: "2024-01-01",
        end_date: "2024-01-07",
      };

      await nasaController.getNearEarthObjects(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("NEO API Error"),
        })
      );
    });
  });
});
