import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const tags = ["Members"];

export const list = createRoute({
  path: "/members",
  method: "get",
  tags,
  responses: {
    [HTTPStatusCode.OK]: jsonContent(
      z.array(z.object({
        name: z.string(),
        phone: z.string(),
        email: z.string().nullable(),
      })),
      "List gym members",
    ),
  },
});

export type ListMemberRoutes = typeof list;
