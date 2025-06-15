import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { visitLogsSelectSchema } from "@/db/schema.js";

const tags = ["Visit Logs"];

export const list = createRoute({
  path: "/visit-logs",
  method: "get",
  tags,
  responses: {
    [HTTPStatusCode.OK]: jsonContent(
      z.array(visitLogsSelectSchema),
      "List visit logs",
    ),
  },
});

export type ListVisitLogRoutes = typeof list;
