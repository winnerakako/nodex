import express, { Express } from "express";
import { config } from "./system/config";
import { setupMiddlewares, handleUnhandledErrors } from "./system/middlewares";
import { setupServerCluster } from "./system/cluster";

// Set Timezone
process.env.TZ = config.timezone;

// Create Express app
const app: Express = express();

// Setup middlewares
setupMiddlewares(app);

// GLOBAL EXCEPTION HANDLERS
handleUnhandledErrors();

// Setup Server Clusters
setupServerCluster(app);
