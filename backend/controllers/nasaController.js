const axios = require("axios"); // Import axios for making HTTP requests
// Load environment variables
const NASA_API_KEY = process.env.NASA_API_KEY;
const NASA_BASE_URL = "https://api.nasa.gov";

// Helper function to make NASA API calls
const makeNASARequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${NASA_BASE_URL}${endpoint}`, {
      params: {
        api_key: NASA_API_KEY,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`NASA API Error for ${endpoint}:`, error.message);
    throw new Error(`Failed to fetch data from NASA API: ${error.message}`);
  }
};

// APOD Controllers
exports.getAPOD = async (req, res, next) => {
  try {
    const { date, count, start_date, end_date } = req.query;
    const data = await makeNASARequest("/planetary/apod", {
      date,
      count,
      start_date,
      end_date,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};
// Get APOD by date
exports.getAPODByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const data = await makeNASARequest("/planetary/apod", { date });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Download Image Controller
exports.downloadImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.query;
    if (!imageUrl) {
      return res.status(400).json({ message: "Missing imageUrl query param" });
    }

    const response = await axios.get(imageUrl, { responseType: "stream" });

    res.setHeader("Content-Type", response.headers["content-type"]);

    response.data.pipe(res); // Stream image to client
  } catch (error) {
    console.error("Image download error:", error.message);
    res.status(500).json({ message: "Failed to download image" });
  }
};

// Mars Rover Controllers
// Get Mars photos by rover
exports.getMarsPhotos = async (req, res, next) => {
  try {
    const { rover } = req.params;
    const { sol, earth_date, camera, page } = req.query;

    const data = await makeNASARequest(
      `/mars-photos/api/v1/rovers/${rover}/photos`,
      {
        sol,
        earth_date,
        camera,
        page,
      }
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Near Earth Objects Controller
exports.getNearEarthObjects = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: "start_date and end_date are required parameters",
      });
    }

    const data = await makeNASARequest("/neo/rest/v1/feed", {
      start_date,
      end_date,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};
