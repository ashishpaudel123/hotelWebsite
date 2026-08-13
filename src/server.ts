import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });
import express, { Application, Request, Response } from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { authRoutes } from "./modules/auth";
import { cmsRoutes } from "./modules/cms";
import { roomRoutes } from "./modules/rooms";
import { errorHandler } from "./utils/errors";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import { Logger } from "./utils/logger";
import { connectDatabase } from "./config/database";

const logger = new Logger("Server");

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
// Allow a single origin or a comma-separated list in FRONTEND_URL for local development
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = frontendUrl.split(",").map((s) => s.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, curl)
      if (!origin) return callback(null, true);
      // Allow explicit matches or any localhost dev origin
      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Mount legacy backend modules (bookings, payments) if present
try {
  const legacyModulesPath = path.resolve(
    __dirname,
    "../backend/src/modules/index.js",
  );
  if (fs.existsSync(legacyModulesPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const legacyModules = require(legacyModulesPath);
    if (legacyModules) {
      app.use("/api/v1", legacyModules);
      logger.info("Mounted legacy backend modules", {
        path: legacyModulesPath,
      });
    }
  } else {
    logger.info("Legacy backend modules not found at expected path", {
      path: legacyModulesPath,
    });
  }
} catch (err) {
  logger.info("Failed to mount legacy backend modules", {
    err: (err as Error).message,
  });
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }),
  );
}

// Rate limiting
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", cmsRoutes);
app.use("/api/v1", roomRoutes);

// Mount legacy backend modules (bookings, payments) if present
try {
  const legacyModulesPath = path.resolve(
    __dirname,
    "../backend/src/modules/index.js",
  );
  if (fs.existsSync(legacyModulesPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const legacyModules = require(legacyModulesPath);
    if (legacyModules) {
      app.use("/api/v1", legacyModules);
      logger.info("Mounted legacy backend modules", {
        path: legacyModulesPath,
      });
    }
  } else {
    logger.info("Legacy backend modules not found at expected path", {
      path: legacyModulesPath,
    });
  }
} catch (err) {
  logger.info("Failed to mount legacy backend modules", {
    err: (err as Error).message,
  });
  // Provide lightweight fallback routes for bookings during local development
  app.get("/api/v1/bookings", (req: Request, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    // Return a sample booking for local dev so the admin UI can display data
    const sample = {
      _id: "64f8c1b2a1b2c3d4e5f6a7b8",
      bookingReference: "HTL-20260812-1234",
      guestDetails: {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        phone: "+9779810000000",
      },
      checkIn: new Date().toISOString(),
      checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      rooms: [
        {
          roomTypeId: { _id: "rtype1", name: "Deluxe" },
          quantity: 1,
          pricePerNight: 5000,
          totalNights: 2,
        },
      ],
      pricing: {
        subtotal: 10000,
        tax: 1300,
        discount: 0,
        total: 11300,
        currency: "NPR",
      },
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: [sample],
      meta: {
        page,
        limit,
        total: 1,
        totalPages: 1,
      },
    });
  });

  app.get("/api/v1/bookings/:id", (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { code: "RES_002", message: "Booking not found" },
    });
  });
}

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Hotel Management & Booking System API",
    version: "v1",
    documentation: "/api/docs",
    health: "/health",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "RES_001",
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        env: process.env.NODE_ENV,
        port: PORT,
      });
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled Rejection at:", { promise, reason });
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: any) => {
  logger.error("Uncaught Exception:", { error });
  process.exit(1);
});

startServer();

export default app;
