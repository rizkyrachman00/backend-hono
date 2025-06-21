import { or } from "drizzle-orm";
import * as HTTPStatusCode from "stoker/http-status-codes";

import type { MemberId } from "@/db/schema.js";
import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";
import {

  members,
  membershipCardBranches,
  membershipCards,
  subscriptions,
} from "@/db/schema.js";

import type { CreateSubscriptionRoutes } from "./subscription.routes.js";

export const create: AppRouteHandler<CreateSubscriptionRoutes> = async (c) => {
  const { member, branchIds, activeSince, activeUntil } = c.req.valid("json");
  const createdBy = c.get("authUser")?.email ?? "system";

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
