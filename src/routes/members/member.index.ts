import { createRouter } from "@/lib/create.app.js";
import { clerkAuthMiddleware } from "@/middlewares/clerk.auth.js";

import * as handlers from "./member.handlers.js";
import * as routes from "./member.routes.js";

const router = createRouter();

router.use(clerkAuthMiddleware);

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;
