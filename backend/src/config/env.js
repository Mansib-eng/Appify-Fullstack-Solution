import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

if (!env.mongoUri) {
  throw new Error("MONGODB_URI is missing.");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is missing.");
}
