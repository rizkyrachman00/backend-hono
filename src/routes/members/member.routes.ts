import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { membersSelectSchema } from "@/db/schema.js";

const tags = ["Members"];

export const list = createRoute({
  path: "/members",
  method: "get",
  tags,
  responses: {
    [HTTPStatusCode.OK]: jsonContent(
      z.array(membersSelectSchema),
      "List gym members",
    ),
  },
});

export type ListMemberRoutes = typeof list;
