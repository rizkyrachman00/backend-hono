import { createRoute, z } from "@hono/zod-openapi";

import { createRouter } from "@/lib/create.app.js";

const router = createRouter()
  .openapi(createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: "Get Data index",
      },
    },
  }), (c) => {
    return c.json({ message: "DB API" });
  });

export default router;
