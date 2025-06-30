import * as HTTPStatusCode from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types.js";
import type { CreateSubscriptionRoutes } from "@/routes/subscriptions/subscription.routes.js";

// Helper: format 422 validation error
export function validationError(c: Parameters<AppRouteHandler<CreateSubscriptionRoutes>>[0], issues: {
  code: string;
  path: (string | number)[];
  message?: string;
}[]) {
  return c.json({
    success: false,
    error: {
      name: "ValidationError",
      issues,
    },
  }, HTTPStatusCode.UNPROCESSABLE_ENTITY);
}
