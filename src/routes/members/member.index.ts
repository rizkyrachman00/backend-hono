import { createRouter } from "@/lib/create.app.js";

import * as handlers from "./member.handlers.js";
import * as routes from "./member.routes.js";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch);

export default router;
