import express from "express";
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const xss = require("xss");
const hpp = require("hpp");
// const csurf = require("csurf");
// const cookieParser = require("cookie-parser");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
// const { body, validationResult } = require("express-validator");

// 1. HTTPS Redirect in production
const httpsRedirect = (req, res, next) => {
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

// 7. Cookie Parser for CSRF
// const cookieParserMiddleware = cookieParser();

// 8. CSRF protection middleware
// const csrfProtection = csurf({ cookie: true });

// 9. Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// 10. Input sanitization with xss
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};

// 11. Mongo Sanitize
const sanitizeDB = mongoSanitize();

// Export all middlewares
export const setupMiddlewares = (app) => {
  app.use(morgan("dev"));

  // 1. Enable HTTPS Redirect in production
  // app.use(httpsRedirect);
  // 2. Security Headers using Helmet
  app.use(helmetMiddleware);
  // 3. CORS configuration
  // app.use(corsMiddleware);
  // 4. HTTP Parameter Pollution Prevention using hpp
  app.use(hppMiddleware);
  // 5. Rate limiting for brute-force protection
  app.use(limiter);
  // 6. Body parsers
  app.use(bodyParsers);

  // 7. Cookie Parser (required for CSRF protection)
  // app.use(cookieParserMiddleware);
  // 8. CSRF Protection (via cookie)
  // app.use(csrfProtection);

  // 9. Compression middleware
  app.use(compressionMiddleware);
  //   10. Input sanitization with xss
  // app.use(sanitizeInput);
  // 11. DATA Sanitization against NoSQL query injection
  app.use(sanitizeDB);

  app.use((req, res, next) => {
    console.log("Request received:", req.body, req.files);
    next();
  });
};

// NODE UNHANDLED ERRORS
export const handleUnhandledErrors = () => {
  // Uncaught Exception
  process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception::", error);
    // TODO
    // SEND EMAIL TO NOTIFY ADMIN
  });
  // Unhandled Rejection
  process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection:", reason);
    console.log("Promise:", promise);
    // TODO
    // SEND EMAIL TO NOTIFY ADMIN
  });
};

// 11. Validation middleware
// const validateUserInput = [
//   body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
//   body("password")
//     .isLength({ min: 8 })
//     .withMessage("Password must be at least 8 characters long"),
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     next();
//   },
// ];

// // Example route with CSRF and validation protection
// app.get('/form', (req, res) => {
//     res.send(`<form method="POST" action="/submit">
//                 <input type="text" name="email" />
//                 <input type="text" name="password" />
//                 <input type="hidden" name="_csrf" value="${req.csrfToken()}" />
//                 <button type="submit">Submit</button>
//               </form>`);
//   });

//   app.post('/submit', validateUserInput, (req, res) => {
//     res.send(`Data received safely: ${JSON.stringify(req.body)}`);
//   });

//   // Error handling for CSRF token mismatch
//   app.use((err, req, res, next) => {
//     if (err.code === 'EBADCSRFTOKEN') {
//       return res.status(403).json({ error: 'Invalid CSRF token' });
//     }
//     next(err);
//   });
