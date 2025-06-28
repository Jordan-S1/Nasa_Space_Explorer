const request = require("supertest");
const nock = require("nock");

// Import the actual app
const app = require("../../index");

describe("NASA API Integration Tests", () => {
  beforeEach(() => {
    // Clean all HTTP mocks
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  // Test for APOD endpoint
  describe("GET /api/nasa/apod", () => {
    it("should return APOD data from NASA API", async () => {
      const mockAPODData = {
        title: "Test APOD Title",
        explanation: "Test explanation",
        url: "https://apod.nasa.gov/apod/image/test.jpg",
        date: "2024-01-01",
      };

      // Mock NASA API response
      nock("https://api.nasa.gov")
        .get("/planetary/apod")
        .query({
          api_key: process.env.NASA_API_KEY,
          date: "2024-01-01",
        })
        .reply(200, mockAPODData);

      const response = await request(app)
        .get("/api/nasa/apod?date=2024-01-01")
        .expect(200);

      expect(response.body).toEqual(mockAPODData);
    });

    it("should handle NASA API errors gracefully", async () => {
      // Mock NASA API error
      nock("https://api.nasa.gov")
        .get("/planetary/apod")
        .query(true)
        .reply(502, { error: "NASA API Error" });

      const response = await request(app).get("/api/nasa/apod").expect(502);

      expect(response.body).toHaveProperty("error", "NASA API Error");
    });
  });

  describe("GET /api/nasa/mars/:rover/photos", () => {
    it("should return Mars rover photos", async () => {
      const mockMarsData = {
        photos: [
          {
            id: 102693,
            sol: 1000,
            camera: { name: "FHAZ" },
            img_src: "http://mars.jpl.nasa.gov/msl-raw-images/test.jpg",
            earth_date: "2015-05-30",
          },
        ],
      };

      nock("https://api.nasa.gov")
        .get("/mars-photos/api/v1/rovers/curiosity/photos")
        .query({
          api_key: process.env.NASA_API_KEY,
          sol: "1000",
        })
        .reply(200, mockMarsData);

      const response = await request(app)
        .get("/api/nasa/mars/curiosity/photos?sol=1000")
        .expect(200);

      expect(response.body).toEqual(mockMarsData);
      expect(response.body.photos).toHaveLength(1);
    });
  });

  describe("GET /api/nasa/neo", () => {
    it("should return Near Earth Objects data", async () => {
      const mockNEOData = {
        near_earth_objects: {
          "2024-01-01": [
            {
              name: "(2024 AA1)",
              estimated_diameter: {
                kilometers: {
                  estimated_diameter_min: 0.1,
                  estimated_diameter_max: 0.3,
                },
              },
            },
          ],
        },
      };

      nock("https://api.nasa.gov")
        .get("/neo/rest/v1/feed")
        .query({
          api_key: process.env.NASA_API_KEY,
          start_date: "2024-01-01",
          end_date: "2024-01-07",
        })
        .reply(200, mockNEOData);

      const response = await request(app)
        .get("/api/nasa/neo?start_date=2024-01-01&end_date=2024-01-07")
        .expect(200);

      expect(response.body).toEqual(mockNEOData);
    });

    it("should require both start_date and end_date", async () => {
      const response = await request(app)
        .get("/api/nasa/neo?start_date=2024-01-01")
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "start_date and end_date are required parameters"
      );
    });
  });
});
