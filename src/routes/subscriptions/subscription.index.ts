import { createRouter } from "@/lib/create.app.js";

import * as handlers from "./subscription.handlers.js";
import * as routes from "./subscription.routes.js";

const router = createRouter();

router
  .openapi(routes.create, handlers.create)
;

export default router;
