import { eq, or } from "drizzle-orm";
import * as HTTPStatusCode from "stoker/http-status-codes";

import type { MemberId } from "@/db/schema.js";
import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";
import {

  branches,
  members,
  membershipCardBranches,
  membershipCards,
  subscriptions,
} from "@/db/schema.js";

import type { CreateSubscriptionRoutes, ListSubscriptionsRoute } from "./subscription.routes.js";

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

  const allCardBranches = await db
    .select()
    .from(membershipCardBranches)
    .innerJoin(branches, eq(membershipCardBranches.branchId, branches.id));

  // Kelompokkan cabang berdasarkan ID kartu
  const groupedBranches = new Map<string, typeof branches.$inferSelect[]>();
  for (const row of allCardBranches) {
    const membershipCardId = row.membership_card_branches.membershipCardId;
    if (!membershipCardId)
      continue;
    const list = groupedBranches.get(membershipCardId) ?? [];
    list.push(row.branches);
    groupedBranches.set(membershipCardId, list);
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
      branches: groupedBranches.get(row.membership_cards.id) ?? [],
    });

    groupedByMember.set(memberId, entry);
  }

  return c.json(Array.from(groupedByMember.values()));
};
