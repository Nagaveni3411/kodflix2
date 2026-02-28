import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { ensureUsersTable } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
let dbReady = false;
let dbLastError = null;

app.set("trust proxy", 1);
const configuredOrigins = String(process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowVercelPreviews = String(process.env.ALLOW_VERCEL_PREVIEWS || "true").toLowerCase() === "true";

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (configuredOrigins.length === 0) {
    // Safe-ish fallback for deployments where FRONTEND_URL was not configured.
    return /^https?:\/\/.+$/i.test(origin);
  }
  if (configuredOrigins.includes(origin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return true;
  if (allowVercelPreviews && /^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Kodflix Auth API is running",
    health: "/api/health",
    authBase: "/api/auth"
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    dbReady,
    jwtConfigured: Boolean(process.env.JWT_SECRET),
    dbLastError,
    corsConfiguredOrigins: configuredOrigins,
    allowVercelPreviews
  });
});

app.use("/api/auth", authRoutes);

async function initializeDatabaseWithRetry() {
  try {
    await ensureUsersTable();
    dbReady = true;
    dbLastError = null;
    console.log("Database initialization successful");
  } catch (error) {
    dbReady = false;
    dbLastError = error?.message || "Database initialization failed";
    console.error("Database initialization failed. Retrying in 15 seconds...");
    console.error(error);
    setTimeout(initializeDatabaseWithRetry, 15000);
  }
}

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is missing. Login will fail until it is configured.");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  void initializeDatabaseWithRetry();
});
