const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nutriplan";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      dbName: "nutriplan",
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    return null;
  }
};

module.exports = { connectDB };
