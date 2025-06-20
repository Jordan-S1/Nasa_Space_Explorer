const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  // NASA API rate limit error
  if (err.message.includes("rate limit")) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      message: "Too many requests to NASA API. Please try again later.",
    });
  }

  // NASA API error
  if (err.message.includes("NASA API")) {
    return res.status(502).json({
      error: "NASA API Error",
      message: "Unable to fetch data from NASA. Please try again later.",
    });
  }

  // Default error
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong!",
  });
};

module.exports = errorHandler;
