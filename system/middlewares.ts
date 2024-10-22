import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import xss from "xss";
import hpp from "hpp";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";

// 1. HTTPS Redirect in production
const httpsRedirect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
};

// 2. Helmet for security headers
const helmetMiddleware = helmet();

// 3. CORS middleware
const corsOptions = {
  origin: ["https://yourdomain.com", "https://anotherdomain.com"],
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
const corsMiddleware = cors(corsOptions);

// 4. HPP (HTTP Parameter Pollution) Protection
const hppMiddleware = hpp();

// 5. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// 6. Body parsers
const bodyParsers = [express.json(), express.urlencoded({ extended: true })];

// 7. Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// 8. Input sanitization with xss
const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.body) {
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};

// 9. Mongo Sanitize
const sanitizeDB = mongoSanitize();

// Setup Middlewares
export const setupMiddlewares = (app: Application): void => {
  app.use(morgan("dev")); // Logging middleware

  // 1. Enable HTTPS Redirect in production
  app.use(httpsRedirect);

  // 2. Security Headers using Helmet
  app.use(helmetMiddleware);

  // 3. CORS configuration
  app.use(corsMiddleware);

  // 4. HTTP Parameter Pollution Prevention using HPP
  app.use(hppMiddleware);

  // 5. Rate limiting for brute-force protection
  app.use(limiter);

  // 6. Body parsers
  app.use(bodyParsers);

  // 7. Compression middleware
  app.use(compressionMiddleware);

  // 8. Input sanitization with XSS
  app.use(sanitizeInput);

  // 9. DATA Sanitization against NoSQL query injection
  app.use(sanitizeDB);

  // Debugging - log request body and files
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log("Request received:", req.body);
    next();
  });
};

// NODE UNHANDLED ERRORS
export const handleUnhandledErrors = (): void => {
  // Uncaught Exception
  process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception::", error);
    // Optionally send an email to admin
    // Use a service like SendGrid, SES, etc.
  });

  // Unhandled Rejection
  process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection:", reason);
    console.log("Promise:", promise);
    // Optionally send an email to admin
  });
};
