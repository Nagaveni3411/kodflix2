import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/userModel.js";

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

function isLocalOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(String(origin || ""));
}

function getCookieOptions(req) {
  const origin = req.headers.origin || "";
  const local = isLocalOrigin(origin);

  // Cross-site frontend/backend in production requires SameSite=None + Secure.
  return {
    httpOnly: true,
    secure: !local,
    sameSite: local ? "lax" : "none",
    maxAge: 24 * 60 * 60 * 1000
  };
}

function setAuthCookie(req, res, token) {
  res.cookie("token", token, {
    ...getCookieOptions(req)
  });
}

export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await createUser({ name: name.trim(), email: normalizedEmail, passwordHash });

    return res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const storedHash =
      typeof user.password === "string"
        ? user.password
        : Buffer.isBuffer(user.password)
          ? user.password.toString("utf8")
          : "";

    if (!storedHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, storedHash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    setAuthCookie(req, res, token);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
}

export function logout(req, res) {
  res.clearCookie("token", {
    ...getCookieOptions(req)
  });

  return res.status(200).json({ message: "Logged out" });
}
