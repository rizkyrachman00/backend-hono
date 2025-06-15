import configureOpenAPI from "./lib/configure.open.api.js";
import createApp from "./lib/create.app.js";
import branches from "./routes/branches/branch.index.js";
import index from "./routes/index.route.js";
import members from "./routes/members/member.index.js";
import visitLogs from "./routes/visit-logs/visit-log.index.js";

const app = createApp();

const routes = [
  index,
  members,
  branches,
  visitLogs,
];

configureOpenAPI(app);

routes.forEach((route) => {
  app.route("/", route);
});

export default app;
