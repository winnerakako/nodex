import { readdirSync } from "fs";
import { Express } from "express"; // Import Express types

// Define the interface for your config object
interface Config {
  apiversion: string;
}

// Setup routes function with proper TypeScript typing
export const setupRoutes = (app: Express, config: Config): void => {
  // Read all files in the ./routes directory
  readdirSync("./routes").forEach((fileName) => {
    if (fileName.endsWith(".ts") || fileName.endsWith(".js")) {
      // Ensure we only process .ts or .js files
      const route = require(`../routes/${fileName}`).default; // Assuming the route files export 'default'
      app.use(`/api/${config.apiversion}`, route); // Mount the route with API versioning
    }
  });
};
