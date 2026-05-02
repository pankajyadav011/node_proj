/**
 * config/db.js
 * MongoDB connection setup using Mongoose.
 * Reads the MONGO_URI from environment variables and
 * establishes a connection with graceful error handling.
 */

const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the MONGO_URI env variable.
 * Exits the process if the connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit process with failure code so the app doesn't silently run without DB
    process.exit(1);
  }
};

module.exports = connectDB;
