import express from "express";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { config } from "./config/index.ts";
import { requestLogger } from "./middleware/logging.middleware.ts";
import { errorHandler } from "./middleware/error.middleware.ts";
import { globalRateLimiter } from "./middleware/rate-limiting.middleware.ts";
import { apiRouter } from "./routes/api.routes.ts";
import { seedDatabaseIfEmpty } from "./database/seeding.ts";
import { KnowledgeBaseService } from "./services/intel/knowledge-base.service.ts";

async function startServer() {
  const app = express();
  const PORT = config.port;

  // Start background embedding initialization
  KnowledgeBaseService.initialize().catch((err) => {
    console.error("[Server Startup] KnowledgeBaseService initialization failed:", err.message);
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false
    })
  );

  app.use(compression());

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"]
    })
  );

  app.use(express.json({ limit: "20mb" }));

  app.use(requestLogger);

  app.use("/api", globalRateLimiter);

  await seedDatabaseIfEmpty();

  app.use("/api", apiRouter);

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      service: "RakshaNet Modular Relational Backend",
      timestamp: new Date().toISOString()
    });
  });

  if (config.nodeEnv !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RakshaNet Modular Server] Running on http://localhost:${PORT} in ${config.nodeEnv} mode`);
  });
}

startServer().catch((err) => {
  console.error("Fatal modular server startup error:", err);
});

export default startServer;
