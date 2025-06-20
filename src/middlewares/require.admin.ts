import type { MiddlewareHandler } from "hono";

import * as HTTPStatusCode from "stoker/http-status-codes";

export const requireAdminMiddleware: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");

  if (!user || user.role !== "admin") {
    return c.json({ message: "Forbidden: Admins only" }, HTTPStatusCode.FORBIDDEN);
  }

  await next();
};
