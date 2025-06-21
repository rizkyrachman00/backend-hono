import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import {
  membersInsertSchema,
  subscriptionsSelectSchema,
} from "@/db/schema.js";

const tags = ["Subscriptions"];

const createSubscriptionBody = z.object({
  member: membersInsertSchema,
  branchIds: z.array(z.string().uuid()).min(1, "Minimal 1 cabang wajib"),
  activeSince: z.string().datetime(),
  activeUntil: z.string().datetime(),
});

const createSubscriptionResponse = z.object({
  subscription: subscriptionsSelectSchema,
});

export const create = createRoute({
  path: "/subscription",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      createSubscriptionBody,
      "Membuat subscription membership baru (bersama member & cabang)",
    ),
  },
  responses: {
    [HTTPStatusCode.CREATED]: jsonContent(
      createSubscriptionResponse,
      "Subscription berhasil dibuat",
    ),
    [HTTPStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createSubscriptionBody),
      "Validasi gagal. Periksa kembali format atau data yang dikirim.",
    ),
  },
});

export type CreateSubscriptionRoutes = typeof create;
