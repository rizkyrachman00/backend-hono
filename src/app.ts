import configureOpenAPI from "./lib/configure.open.api.js";
import createApp from "./lib/create.app.js";
import { clerkAuthMiddleware } from "./middlewares/clerk.auth.js";
import { requireAdminMiddleware } from "./middlewares/require.admin.js";
import branches from "./routes/branches/branch.index.js";
import checkin from "./routes/check-in/check-in.index.js";
import index from "./routes/index.route.js";
import members from "./routes/members/member.index.js";
import subscriptions from "./routes/subscriptions/subscription.index.js";
import visitLogs from "./routes/visit-logs/visit-log.index.js";

const app = createApp();

configureOpenAPI(app);

// Public access
const publicAccessRoutes = [
  index,
  branches,
];

publicAccessRoutes.forEach((route) => {
  app.route("/", route);
});

// Authenticated (no admin required)
const authOnlyRoutes = [
  checkin,
];

const authOnlyRouter = createApp().use(clerkAuthMiddleware);
authOnlyRoutes.forEach((route) => {
  authOnlyRouter.route("/", route);
});

app.route("/", authOnlyRouter);

// Admin-only access
const adminAccessRoutes = [
  members,
  subscriptions,
  visitLogs,
];

const adminRestrictedRouter = createApp()
  .use(clerkAuthMiddleware)
  .use(requireAdminMiddleware);
adminAccessRoutes.forEach((route) => {
  adminRestrictedRouter.route("/", route);
});

app.route("/", adminRestrictedRouter);

export default app;
