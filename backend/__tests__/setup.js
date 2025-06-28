// Mock environment variables
process.env.NASA_API_KEY = "test-api-key";
process.env.NODE_ENV = "test";

// Mock console.error to avoid cluttering test output
global.console.error = jest.fn();
