const express = require("express");
const cors = require("cors");
require("dotenv").config();

const nasaRoutes = require("./routes/nasa");
const errorHandler = require("./middleware/errorHandler");

// Initialize Express app
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'https://nasa-space-explorer-hazel.vercel.app' // Deployed frontend
  ],
  credentials: true // if you're using cookies/sessions
}));
app.use(express.json());

// health check route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Routes
app.use("/api/nasa", nasaRoutes);

// Error Handling Middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
module.exports = app; // Export app for testing
