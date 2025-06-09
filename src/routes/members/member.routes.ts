import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

export  const list = createRoute({
  path: "/members",
  method: "get",
  responses: {
    [HTTPStatusCode.OK]: jsonContent(
      z.array(z.object({
        name: z.string(),
        done: z.boolean(),
      })),
      "List gym members",
    ),
  },
});

export type ListMemberRoutes = typeof list;
