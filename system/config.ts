import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

// Load environment variables depending on the NODE_ENV value
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
} else {
  dotenv.config({ path: path.resolve(__dirname, "../.env.dev") });
}

// Log enviroment file
console.log("Env:", process.env.NODE_ENV, process.env.DATABASE);

interface Config {
  port: number | string;
  environment: string;
  database: string | undefined;
  timezone: string;
  apiversion: string;
}

export const config: Config = {
  port: process.env.PORT || 8000,
  environment: process.env.NODE_ENV || "development",
  database: process.env.DATABASE,
  timezone: process.env.TZ || "Africa/Lagos",
  apiversion: process.env.API_VERSION || "v1",
};

// Track connection status
let isConnected = false;

export const connectDB = async (
  retryCount: number = 5
): Promise<boolean | void> => {
  console.log("isConnected", isConnected);

  if (isConnected) {
    console.log("DB connected already");
    return isConnected;
  }

  try {
    await mongoose.connect(process.env.DATABASE as string);
    isConnected = true;
    console.log("**DB CONNECTED**");
    return isConnected;
  } catch (err: any) {
    console.log("DB CONNECTION ERR:", err.message);

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
