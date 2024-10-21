import cluster from "cluster";
import { config, connectDB } from "./config";
import { runCron, cronCount } from "./cron";
import { globalErrorHandler, notFoundHandler } from "./error";
import { setupRoutes } from "./routes";

export const setupServerCluster = (app) => {
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
      cluster.fork({ WORKER_ROLE: "cron" });
    }

    // Optional: Monitor worker exits and restart them if necessary
    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork(worker.process.env); // Restart the worker with the same role
    });
  } else {
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
