import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: "7d",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
