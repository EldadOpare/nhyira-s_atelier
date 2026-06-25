import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

// Imported this early so a missing Supabase config failed at boot instead of
// halfway through a request.
import "./lib/supabase";

const app: Express = express();

// Vercel sat in front as a proxy, so we trusted it to report the real client IP
// that rate limiting keyed on.
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// In production we only let the listed origins call the API from a browser.
// Dev allowed any origin so local testing stayed easy.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : process.env.NODE_ENV === "production"
    ? []
    : true;

if (process.env.NODE_ENV === "production" && !process.env.ALLOWED_ORIGINS) {
  logger.warn(
    "ALLOWED_ORIGINS was not set in production, so browser requests from other origins got blocked.",
  );
}

app.use(cors({ origin: allowedOrigins, credentials: true }));

// Capped the body size so nobody could push a giant payload at us.
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "256kb" }));

// Writes got a tighter limit than reads because the public form lived there.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use("/api", globalLimiter);
app.use("/api", (req, res, next) =>
  req.method === "GET" || req.method === "HEAD"
    ? next()
    : writeLimiter(req, res, next),
);

app.use("/api", router);

// Kept real errors in the server logs and only sent the client a plain message.
// This stopped stack traces and SQL text from leaking out.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err }, "Unhandled error");
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

export default app;
