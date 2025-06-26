import { createRoute } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { createSubscriptionBody, createSubscriptionResponse, extendSubscriptionBody, extendSubscriptionErrorResponse, extendSubscriptionResponse, memberWithSubscriptionsListResponseSchema } from "@/openapi/schemas/subscription.schemas.js";

const tags = ["Subscriptions"];

// POST /subscription
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

// GET /subscriptions
export const list = createRoute({
  method: "get",
  path: "/subscriptions",
  tags,
  responses: {
    [HTTPStatusCode.OK]: jsonContent(
      memberWithSubscriptionsListResponseSchema,
      "List of members and their subscriptions",
    ),
  },
});

export const extend = createRoute({
  method: "post",
  path: "/subscription/extend",
  tags,
  request: {
    body: jsonContentRequired(extendSubscriptionBody, "Tambahkan subscription baru"),
  },
  responses: {
    [HTTPStatusCode.CREATED]: jsonContent(
      extendSubscriptionResponse,
      "Subscription baru berhasil ditambahkan",
    ),
    [HTTPStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(
      extendSubscriptionErrorResponse,
      "Validasi gagal",
    ),
  },
});

export type CreateSubscriptionRoutes = typeof create;
export type ListSubscriptionsRoute = typeof list;
export type ExtendSubscriptionRoutes = typeof extend;
