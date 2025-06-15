import { createRouter } from "@/lib/create.app.js";

import * as handlers from "./branch.handlers.js";
import * as routes from "./branch.routes.js";

const router = createRouter()
  .openapi(routes.list, handlers.list);

export default router;
