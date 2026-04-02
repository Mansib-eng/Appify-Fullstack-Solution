import bcrypt from "bcryptjs";
import validator from "validator";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export async function register(req, res) {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    passwordHash,
  });

  const token = signToken(user._id.toString());

  return res.status(201).json({
    message: "Registration successful",
    token,
    user: user.toSafeObject(),
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken(user._id.toString());

  return res.json({
    message: "Login successful",
    token,
    user: user.toSafeObject(),
  });
}

export async function me(req, res) {
  return res.json({
    user: req.user.toSafeObject(),
  });
}
