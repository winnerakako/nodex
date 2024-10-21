import { readdirSync } from "fs";

export const setupRoutes = (app, config) => {
  readdirSync("./routes").map((fileName) => {
    app.use(`/api/${config.apiversion}`, require(`../routes/${fileName}`));
  });
};
