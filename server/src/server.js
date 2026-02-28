import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { ensureUsersTable } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => {
      const configuredOrigin = process.env.FRONTEND_URL;

      // Allow non-browser tools and same-origin requests.
      if (!origin) return callback(null, true);

      // Explicitly allow configured frontend origin when provided.
      if (configuredOrigin && origin === configuredOrigin) {
        return callback(null, true);
      }

      // Allow local Vite dev servers on any localhost port.
      if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
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
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

(async () => {
  try {
    await ensureUsersTable();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:");
    console.error(error);
    process.exit(1);
  }
})();
