import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { visitLogListSchema } from "@/openapi/schemas/visit-log.schemas.js";

const tags = ["Visit Logs"];

export const list = createRoute({
  path: "/visit-logs",
  method: "get",
  tags,
  responses: {
    [HTTPStatusCode.OK]: jsonContent(
      visitLogListSchema,
      "List visit logs",
    ),
  },
});

export type ListVisitLogRoutes = typeof list;
