import { createRouter } from "@/lib/create.app.js";

import * as handlers from "./check-situasi.handlers.js";
import * as routes from "./check-situasi.routes.js";

const router = createRouter()
  .openapi(routes.checkSituasi, handlers.checkSituasi);

export default router;
