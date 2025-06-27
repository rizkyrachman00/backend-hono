import { z } from "zod";

// GET /visit-logs
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

// POST /checkin
export const checkinBodySchema = z.object({
  type: z.enum(["member", "guest"]),
  memberId: z.string().uuid().optional(), // jika member
  guestName: z.string().optional(), // jika guest
  guestPhone: z.string().optional(),
  branchId: z.string().uuid(),
});

export const checkinResponseSchema = z.object({
  message: z.string(),
  visitLogId: z.string(),
});
