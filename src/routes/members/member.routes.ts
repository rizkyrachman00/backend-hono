import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { membersInsertSchema, membersSelectSchema } from "@/db/schema.js";

const tags = ["Members"];

// GET /members
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

// POST /members
export const create = createRoute({
  path: "/members",
  method: "post",
  request: {
    body: jsonContentRequired(
      membersInsertSchema,
      "To Create gym members",
    ),
  },
  tags,
  responses: {
    [HTTPStatusCode.OK]: jsonContent(
      membersSelectSchema,
      "Create gym members",
    ),
    [HTTPStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(membersInsertSchema),
      "Unprocessable Entity. Validation error(s), Please check the request body.",
    ),
  },
});

export type ListMemberRoutes = typeof list;
export type CreateMemberRoutes = typeof create;
