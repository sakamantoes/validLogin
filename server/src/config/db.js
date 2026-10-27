import mongoose from "mongoose";
import { env } from "./constant.js";

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongodb_url, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

const disconnectDb = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected successfully");
  } catch (err) {
    console.error("Database disconnect error:", err);
  }
};

export { connectDB, disconnectDb };
