import type { MiddlewareHandler } from "hono";

import { verifyJwt } from "@clerk/backend/jwt";
import * as HTTPStatusCode from "stoker/http-status-codes";

import env from "@/env.js";

export const clerkAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, HTTPStatusCode.UNAUTHORIZED);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyJwt(token, {
      key: env.CLERK_JWT_KEY,
    });

    c.set("user", payload);
    await next();
  }
  catch (err) {
    const error = err as Error;
    return c.json({ message: `Unauthorized: ${error.message}` }, HTTPStatusCode.UNAUTHORIZED);
  }
};
