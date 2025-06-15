import { createRouter } from "@/lib/create.app.js";

import * as handlers from "./visit-log.handlers.js";
import * as routes from "./visit-log.routes.js";

const router = createRouter()
  .openapi(routes.list, handlers.list);

export default router;
