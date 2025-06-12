import { z } from "@hono/zod-openapi";

const IdParamsSchema = z.object({
  id: z.string().uuid().openapi({
    param: {
      name: "id",
      in: "path",
      required: true,
    },
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

export default IdParamsSchema;
