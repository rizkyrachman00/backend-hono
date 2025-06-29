import { z } from "zod";

import { branchesSelectSchema } from "@/db/schema.js";

// Ambil hanya field yang dibutuhkan dari branchesSelectSchema
export const branchesPublicSchema = branchesSelectSchema.pick({
  id: true,
  identifier: true,
  name: true,
});

// Schema untuk setiap item hasil check situasi
export const checkSituasiItemSchema = z.object({
  branch: branchesPublicSchema,
  visitorCount: z.number(),
});

// Schema untuk response dari /visit-logs/check-situasi
export const checkSituasiResponseSchema = z.array(checkSituasiItemSchema);
