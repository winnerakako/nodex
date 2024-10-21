import dotenv from "dotenv";
const path = require("path");
import mongoose from "mongoose";

// const envFile =
//   process.env.NODE_ENV === "production" ? "../.env" : "../.env.dev";
// dotenv.config({ path: envFile });
// Load environment variables depending on the NODE_ENV value
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
} else {
  dotenv.config({ path: path.resolve(__dirname, "../.env.dev") });
}

// Log enviroment file
console.log("Env:", process.env.NODE_ENV, process.env.DATABASE);

export const config = {
  port: process.env.PORT || 8000,
  environment: process.env.NODE_ENV || "development",
  database: process.env.DATABASE,
  timezone: process.env.TZ || "Africa/Lagos",
  apiversion: process.env.API_VERSION || "v1",
};

// TrackConnectionStatus
// let isConnected = false;

// export const connectDB = async () => {
//   console.log("isConnected", isConnected);
//   if (isConnected) {
//     console.log("db connected already");
//     return;
//   }
//   try {
//     await mongoose.connect(process.env.DATABASE);
//     isConnected = true;
//     console.log("**DB CONNECTED**");
//     return isConnected;
//   } catch (err) {
//     console.log("DB CONNECTION ERR:", err);
//     if (
//       err.message.includes("ETIMEOUT") ||
//       err.message.includes("ECONNREFUSED")
//     ) {
//       process.exit(1); // Exit process on specific error
//     }
//   }
// };

// Track connection status
let isConnected = false;

export const connectDB = async (retryCount = 5) => {
  console.log("isConnected", isConnected);

  if (isConnected) {
    console.log("DB connected already");
    return isConnected;
  }

  try {
    await mongoose.connect(process.env.DATABASE);
    isConnected = true;
    console.log("**DB CONNECTED**");
    return isConnected;
  } catch (err) {
    console.log("DB CONNECTION ERR:", err);

    // Check for specific error messages
    if (
      err.message.includes("ETIMEOUT") ||
      err.message.includes("ECONNREFUSED")
    ) {
      console.log(`Retrying to connect... (${5 - retryCount + 1})`);

      // If we have retries left, wait and then retry
      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
        return connectDB(retryCount - 1); // Retry connecting
      } else {
        console.error(
          "Failed to connect to the database after multiple attempts."
        );
        process.exit(1); // Exit process after retries
      }
    }
  }
};

// export const connectDB = async () => {
//   await dbConnectionPromise();
// };
