import { createRoute } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import { checkSituasiResponseSchema } from "@/openapi/schemas/check-situasi.schemas.js";

const tags = ["Check-situasi"];

// GET /check-situasi
export const checkSituasi = createRoute({
  method: "get",
  path: "/check-situasi",
  tags,
  responses: {
    [HTTPStatusCode.OK]: jsonContent(
      checkSituasiResponseSchema,
      "Jumlah visitor per branch dalam rentang 2 jam terakhir",
    ),
  },
});

export type CheckSituasiRoute = typeof checkSituasi;
