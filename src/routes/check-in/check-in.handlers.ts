import { and, eq, gte, inArray, lte } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";
import {
  guests,
  membershipCards,
  subscriptionBranches,
  subscriptions,
  visitLogs,
} from "@/db/schema.js";

import type { CheckinRoute } from "./check-in.routes.js";

export const checkin: AppRouteHandler<CheckinRoute> = async (c) => {
  const input = c.req.valid("json");
  const now = new Date();

  if (input.type === "member") {
    if (!input.memberId) {
      return c.json({ message: "memberId diperlukan" }, 422);
    }

    // Ambil semua subscription aktif milik member
    const activeSubscriptions = await db
      .select({ id: subscriptions.id, deletedAt: subscriptions.deletedAt })
      .from(subscriptions)
      .innerJoin(
        membershipCards,
        eq(subscriptions.membershipCardId, membershipCards.id),
      )
      .where(
        and(
          eq(membershipCards.memberId, input.memberId),
          lte(subscriptions.activeSince, now),
          gte(subscriptions.activeUntil, now),
        ),
      );

    // Hanya ambil subscription yang belum dihapus (deletedAt = null)
    const activeValidSubscriptions = activeSubscriptions.filter(s => !s.deletedAt);

    const subscriptionIds = activeValidSubscriptions.map(s => s.id);

    if (subscriptionIds.length === 0) {
      return c.json(
        { message: "Tidak ada subscription aktif" },
        422,
      );
    }

    // Cek apakah subscription aktif tersebut punya akses ke cabang
    const allowedBranch = await db
      .select()
      .from(subscriptionBranches)
      .where(
        and(
          inArray(subscriptionBranches.subscriptionId, subscriptionIds),
          eq(subscriptionBranches.branchId, input.branchId),
        ),
      );

    if (allowedBranch.length === 0) {
      return c.json(
        { message: "Cabang tidak termasuk dalam subscription" },
        422,
      );
    }

    // Simpan visit log untuk member
    const [log] = await db
      .insert(visitLogs)
      .values({
        memberId: input.memberId,
        branchId: input.branchId,
        type: "member",
      })
      .returning();

    return c.json(
      {
        message: "Check-in member berhasil",
        visitLogId: log.id,
      },
      201,
    );
  }

  // Guest
  if (!input.guestName) {
    return c.json({ message: "guestName diperlukan" }, 422);
  }

  const [guest] = await db
    .insert(guests)
    .values({
      name: input.guestName,
      phone: input.guestPhone ?? null,
    })
    .returning();

  const [log] = await db
    .insert(visitLogs)
    .values({
      guestId: guest.id,
      branchId: input.branchId,
      type: "guest",
    })
    .returning();

  return c.json(
    {
      message: "Check-in guest berhasil",
      visitLogId: log.id,
    },
    201,
  );
};
