import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCode from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { createRouter } from "@/lib/create.app.js";

const router = createRouter()
  .openapi(createRoute({
    tags: ["Index"],
    method: "get",
    path: "/",
    responses: {
      [HttpStatusCode.OK]: jsonContent(
        createMessageObjectSchema("DB API"),
        "Get Data index",
      ),
    },
  }), (c) => {
    return c.json({ message: "DB API" }, HttpStatusCode.OK);
  });

export default router;
