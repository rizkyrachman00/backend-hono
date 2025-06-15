import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { branchesSelectSchema } from "@/db/schema.js";

const tags = ["Branches"];

export const list = createRoute({
  path: "/branches",
  method: "get",
  tags,
  responses: {
    [HTTPStatusCode.OK]: jsonContent(
      z.array(branchesSelectSchema),
      "List gym branches",
    ),
  },
});

export type ListBranchRoutes = typeof list;
