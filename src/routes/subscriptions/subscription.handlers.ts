import { eq, inArray, or } from "drizzle-orm";
import * as HTTPStatusCode from "stoker/http-status-codes";

import type { MemberId } from "@/db/schema.js";
import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";
import {

  branches,
  members,
  membershipCardBranches,
  membershipCards,
  subscriptionBranches,
  subscriptions,
} from "@/db/schema.js";

import type { CreateSubscriptionRoutes, ExtendSubscriptionRoutes, ListSubscriptionsRoute } from "./subscription.routes.js";

// POST /subscription
export const create: AppRouteHandler<CreateSubscriptionRoutes> = async (c) => {
  const { member, branchIds, activeSince, activeUntil } = c.req.valid("json");
  const createdBy = c.get("user")?.email ?? "system";

  // 1. Cek apakah member sudah ada (berdasarkan phone dan/atau email)
  const existing = await db.query.members.findFirst({
    where(fields, operators) {
      return or(
        operators.eq(fields.phone, member.phone),
        member.email ? operators.eq(fields.email, member.email) : undefined,
      );
    },
  });

  let memberId: MemberId;

  if (existing) {
    memberId = existing.id;
  }
  else {
    // 2. Insert member baru
    const [newMember] = await db.insert(members)
      .values({
        name: member.name,
        phone: member.phone,
        email: member.email ?? null,
      })
      .returning();

    memberId = newMember.id;
  }

  // 3. Buat kartu membership
  const [card] = await db.insert(membershipCards)
    .values({ memberId })
    .returning();

  // 4. Kaitkan kartu dengan cabang
  await db.insert(membershipCardBranches).values(
    branchIds.map(branchId => ({
      membershipCardId: card.id,
      branchId,
    })),
  );

  // 5. Buat subscription
  const [subscription] = await db.insert(subscriptions)
    .values({
      membershipCardId: card.id,
      activeSince: new Date(activeSince),
      activeUntil: new Date(activeUntil),
      createdBy,
    })
    .returning();

  // 5b. Kaitkan cabang ke subscription
  await db.insert(subscriptionBranches).values(
    branchIds.map(branchId => ({
      subscriptionId: subscription.id,
      branchId,
    })),
  );

  // 6. Kembalikan response sesuai schema openapi
  return c.json({ subscription }, HTTPStatusCode.CREATED);
};

/**
 * GET /subscriptions
 *
 * Mengembalikan daftar subscription lengkap dengan:
 * - Info subscription
 * - Info member
 * - Info kartu membership
 * - Daftar cabang yang terhubung ke kartu
 *
 * Digunakan untuk dashboard admin atau kebutuhan monitoring aktivitas member.
 */
export const list: AppRouteHandler<ListSubscriptionsRoute> = async (c) => {
  const subs = await db
    .select()
    .from(subscriptions)
    .innerJoin(membershipCards, eq(subscriptions.membershipCardId, membershipCards.id))
    .innerJoin(members, eq(membershipCards.memberId, members.id));

  const allSubscriptionBranches = await db
    .select()
    .from(subscriptionBranches)
    .innerJoin(branches, eq(subscriptionBranches.branchId, branches.id));

  // Kelompokkan cabang berdasarkan subscription ID
  const groupedBranches = new Map<string, typeof branches.$inferSelect[]>();
  for (const row of allSubscriptionBranches) {
    const subscriptionId = row.subscription_branches.subscriptionId;
    const list = groupedBranches.get(subscriptionId) ?? [];
    list.push(row.branches);
    groupedBranches.set(subscriptionId, list);
  }

  // Kelompokkan subscription berdasarkan member
  const groupedByMember = new Map<string, {
    member: typeof members.$inferSelect;
    subscriptions: {
      subscription: typeof subscriptions.$inferSelect;
      membershipCard: typeof membershipCards.$inferSelect;
      branches: typeof branches.$inferSelect[];
    }[];
  }>();

  for (const row of subs) {
    const memberId = row.members.id;
    const entry = groupedByMember.get(memberId) ?? {
      member: row.members,
      subscriptions: [],
    };

    entry.subscriptions.push({
      subscription: row.subscriptions,
      membershipCard: row.membership_cards,
      branches: groupedBranches.get(row.subscriptions.id) ?? [],
    });

    groupedByMember.set(memberId, entry);
  }

  return c.json(Array.from(groupedByMember.values()));
};

// POST /subscription/extend
export const extend: AppRouteHandler<ExtendSubscriptionRoutes> = async (c) => {
  const {
    membershipCardId,
    activeSince,
    activeUntil,
    branches: branchIds,
  } = c.req.valid("json");

  const createdBy = c.get("user")?.email ?? "system";

  // 1. Validasi membership card
  const cardExists = await db.query.membershipCards.findFirst({
    where(fields, op) {
      return op.eq(fields.id, membershipCardId);
    },
  });

  if (!cardExists) {
    return c.json(
      { message: "Membership card not found" },
      HTTPStatusCode.UNPROCESSABLE_ENTITY,
    );
  }

  // 2. Validasi semua branchId
  const existingBranches = await db
    .select({ id: branches.id })
    .from(branches)
    .where(inArray(branches.id, branchIds));

  const existingBranchIds = new Set(existingBranches.map(b => b.id));
  const invalidBranchIds = branchIds.filter(id => !existingBranchIds.has(id));

  if (invalidBranchIds.length > 0) {
    return c.json(
      {
        message: "Some branchIds are invalid",
        invalidBranchIds,
      },
      HTTPStatusCode.UNPROCESSABLE_ENTITY,
    );
  }

  // 3. Insert new subscription
  const [subscription] = await db.insert(subscriptions).values({
    membershipCardId,
    activeSince: new Date(activeSince),
    activeUntil: new Date(activeUntil),
    createdBy,
  }).returning();

  // 4. Tambahkan relasi subscription -> branches
  await db.insert(subscriptionBranches).values(
    branchIds.map(branchId => ({
      subscriptionId: subscription.id,
      branchId,
    })),
  );

  // 5. Update membershipCardBranches hanya jika branch baru belum pernah ditambahkan
  const existingRel = await db
    .select({ branchId: membershipCardBranches.branchId })
    .from(membershipCardBranches)
    .where(eq(membershipCardBranches.membershipCardId, membershipCardId));

  const existingRelSet = new Set(existingRel.map(rel => rel.branchId));
  const newRelations = branchIds
    .filter(branchId => !existingRelSet.has(branchId))
    .map(branchId => ({ membershipCardId, branchId }));

  if (newRelations.length > 0) {
    await db.insert(membershipCardBranches).values(newRelations);
  }

  return c.json({
    message: "Subscription extended successfully",
    subscriptionId: subscription.id,
  }, HTTPStatusCode.CREATED);
};
