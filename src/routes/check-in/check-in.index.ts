import { createRouter } from "@/lib/create.app.js";

import * as handlers from "./check-in.handlers.js";
import * as routes from "./check-in.routes.js";

const router = createRouter()
  .openapi(routes.checkin, handlers.checkin);

export default router;
