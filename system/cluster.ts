import cluster, { Worker } from "cluster";
import { Express } from "express";
import { config, connectDB } from "./config";
import { runCron, cronCount } from "./cron";
import { globalErrorHandler, notFoundHandler } from "./error";
import { setupRoutes } from "./routes";

export const setupServerCluster = (app: Express): void => {
  console.log(`Primary ${process.pid} is running`, process.env.NODE_ENV);

  // SET UP CLUSTERS
  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // CONNECT DB
    (async function () {
      await connectDB();
    })();

    // DEFINE ROUTES
    setupRoutes(app, config);

    // ERROR HANDLERS
    // Catch 404 Errors
    app.use(notFoundHandler);
    // Global Error Handling Middleware
    app.use(globalErrorHandler);

    const port = process.env.PORT || 8000;
    app.listen(port, () => console.log(`Server running on port ${port}`));

    // CREATE CRON FORK
    if (cronCount > 0) {
      // Pass WORKER_ROLE in the environment of the forked worker
      cluster.fork({ WORKER_ROLE: "cron" });
    }

    // Monitor worker exits and restart them if necessary
    cluster.on("exit", (worker: Worker, code: number, signal: string) => {
      console.log(`Worker ${worker.process.pid} died. Restarting...`);

      // Instead of accessing worker.process.env, use a more reliable condition
      // You already know this worker was forked for cron, so restart it with WORKER_ROLE = "cron"
      cluster.fork({ WORKER_ROLE: "cron" });
    });
  } else {
    // Handle cron worker tasks if WORKER_ROLE is 'cron'
    if (process.env.WORKER_ROLE === "cron") {
      if (process.env.NODE_ENV === "production") {
        console.log("CRON CLUSTER RUNNING");

        // CONNECT DB
        (async function () {
          await connectDB();
        })();

        runCron(); // RUN CRON FUNCTIONS
      }
    }
  }
};
