import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import {
  checkinBodySchema,
  checkinResponseSchema,
} from "@/openapi/schemas/visit-log.schemas.js";

const tags = ["Check-in"];

// POST /check-in
export const checkin = createRoute({
  path: "/check-in",
  method: "post",
  tags,
  request: {
    body: jsonContent(checkinBodySchema, "Payload untuk check-in member atau guest"),
  },
  responses: {
    [HTTPStatusCode.CREATED]: jsonContent(
      checkinResponseSchema,
      "Check-in berhasil",
    ),
    [HTTPStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      z.object({ message: z.string() }),
      "Validasi gagal",
    ),
    [HTTPStatusCode.NOT_FOUND]: jsonContent(
      z.object({ message: z.string() }),
      "Member tidak ditemukan",
    ),
  },
});

export type CheckinRoute = typeof checkin;
