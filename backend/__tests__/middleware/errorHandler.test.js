const errorHandler = require("../../middleware/errorHandler");

// Error Handler Tests
describe("Error Handler Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should handle rate limit errors", () => {
    const error = new Error("rate limit exceeded");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: "Rate limit exceeded",
      message: "Too many requests to NASA API. Please try again later.",
    });
  });

  it("should handle NASA API errors", () => {
    const error = new Error("NASA API connection failed");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      error: "NASA API Error",
      message: "Unable to fetch data from NASA. Please try again later.",
    });
  });

  it("should handle generic errors in development", () => {
    process.env.NODE_ENV = "development";
    const error = new Error("Something went wrong");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal Server Error",
      message: "Something went wrong",
    });
  });

  it("should handle generic errors in production", () => {
    process.env.NODE_ENV = "production";
    const error = new Error("Something went wrong");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal Server Error",
      message: "Something went wrong!",
    });
  });
});
