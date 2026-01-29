import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import rateLimit from "express-rate-limit";

import { authMiddleware } from "./middleware/authMiddleware";
import { errorHandler } from "./lib/errorHandler";
import { sanitizeInput } from "./lib/validation";
import prisma from "./lib/prisma";

/* ROUTES */
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import authRoutes from "./routes/authRoutes";
import messageRoutes from "./routes/messageRoutes";
import { setupSocketIO } from "./socket";

dotenv.config();

/* REQUIRED ENV CHECK */
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

/* ✅ REQUIRED FOR RAILWAY / PROXY */
app.set("trust proxy", 1);

/* =========================
   ✅ CORS (PRODUCTION SAFE)
========================= */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        origin.endsWith(".vercel.app") ||
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ✅ HANDLE PREFLIGHT */
app.options("*", cors());

/* =========================
   SECURITY
========================= */
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

/* =========================
   BODY PARSERS
========================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================
   LOGGING
========================= */
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

/* =========================
   RATE LIMITING
========================= */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

/* =========================
   SANITIZATION
========================= */
app.use(sanitizeInput);

/* =========================
   STATIC FILES
========================= */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* =========================
   SOCKET.IO
========================= */
const io = new SocketIOServer(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

setupSocketIO(io);
app.set("io", io);

/* =========================
   ROUTES
========================= */
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "healthy" });
  } catch {
    res.status(503).json({ status: "unhealthy" });
  }
});

app.get("/", (_req, res) => {
  res.json({ message: "Rentlify API running" });
});

/* AUTH */
app.use("/auth", authLimiter, authRoutes);

/* PUBLIC */
app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);

/* PROTECTED */
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);
app.use("/messages", authMiddleware(["tenant", "manager"]), messageRoutes);

/* =========================
   ERROR HANDLING
========================= */
app.use(errorHandler);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* =========================
   SERVER
========================= */
const port = Number(process.env.PORT) || 3002;

server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));