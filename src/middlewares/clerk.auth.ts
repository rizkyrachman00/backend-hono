import type { MiddlewareHandler } from "hono";

import { verifyToken } from "@clerk/backend";
import * as HTTPStatusCode from "stoker/http-status-codes";

import env from "@/env.js";

export const clerkAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, HTTPStatusCode.UNAUTHORIZED);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_JWT_KEY!,
    });

    c.set("user", payload);
    await next();
  }
  catch (err) {
    const error = err as Error;
    return c.json({ message: `Unauthorized: ${error.message}` }, HTTPStatusCode.UNAUTHORIZED);
  }
};
