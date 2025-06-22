import type { MiddlewareHandler } from "hono";

import * as HTTPStatusCode from "stoker/http-status-codes";

export const requireAdminMiddleware: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");

  if (!user || user.role !== "admin") {
    return c.json({ message: "Forbidden: Admins only" }, HTTPStatusCode.FORBIDDEN);
  }

  if (!("email" in user) || typeof user.email !== "string") {
    return c.json(
      { message: "Invalid token: email missing" },
      HTTPStatusCode.FORBIDDEN,
    );
  }

  c.set("user", { email: user.email, role: user.role });

  await next();
};
