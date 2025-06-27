import { z } from "zod";

export const visitLogItemSchema = z.object({
  id: z.string(),
  type: z.enum(["member", "guest"]),
  checkinAt: z.string(),
  user: z.union([
    z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      phone: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    }),
    z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      phone: z.string().nullable().optional(),
    }),
  ]),
  branch: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
});

export const visitLogListSchema = z.array(visitLogItemSchema);
