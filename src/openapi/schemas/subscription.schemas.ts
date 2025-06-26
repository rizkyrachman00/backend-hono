import { z } from "@hono/zod-openapi";

import {
  branchesSelectSchema,
  membershipCardsSelectSchema,
  membersInsertSchema,
  membersSelectSchema,
  subscriptionsSelectSchema,
} from "@/db/schema.js";

// POST /subscription
export const createSubscriptionBody = z.object({
  member: membersInsertSchema,
  branchIds: z.array(z.string().uuid()).min(1, "Minimal 1 cabang wajib"),
  activeSince: z.string().datetime(),
  activeUntil: z.string().datetime(),
});

// POST /subscription
export const createSubscriptionResponse = z.object({
  subscription: subscriptionsSelectSchema,
});

// GET /subscriptions
export const memberSubscriptionItemSchema = z.object({
  membershipCard: membershipCardsSelectSchema,
  subscription: subscriptionsSelectSchema,
  branches: z.array(branchesSelectSchema),
});

// GET /subscriptions
export const memberWithSubscriptionsSchema = z.object({
  member: membersSelectSchema,
  subscriptions: z.array(memberSubscriptionItemSchema),
});

// GET /subscriptions
export const memberWithSubscriptionsListResponseSchema = z.array(memberWithSubscriptionsSchema);

// --- Schema untuk request extend subscription ---
export const extendSubscriptionBody = z.object({
  membershipCardId: z.string().uuid(),
  activeSince: z.string().datetime(),
  activeUntil: z.string().datetime(),
  branches: z.array(z.string().uuid()),
}).refine(data => new Date(data.activeUntil) > new Date(data.activeSince), {
  message: "activeUntil must be after activeSince",
  path: ["activeUntil"],
});

// --- Schema untuk response extend subscription ---
export const extendSubscriptionResponse = z.object({
  message: z.string(),
  subscriptionId: z.string().uuid(),
});

// --- Schema untuk response extend subscription error ---
export const extendSubscriptionErrorResponse = z.object({
  message: z.string(),
  invalidBranchIds: z.array(z.string().uuid()).optional(),
});
