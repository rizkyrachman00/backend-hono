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
import { validationError } from "@/openapi/schemas/validation-error.js";

import type { CreateSubscriptionRoutes, DeleteSubscriptionRoutes, ExtendSubscriptionRoutes, ListSubscriptionsRoute } from "./subscription.routes.js";

// POST /subscription
export const create: AppRouteHandler<CreateSubscriptionRoutes> = async (c) => {
  const { member, branchIds, activeSince, activeUntil } = c.req.valid("json");
  const createdBy = c.get("user")?.email ?? "system";

  // --- VALIDASI ---
  const issues: {
    code: string;
    path: (string | number)[];
    message?: string;
  }[] = [];

  // 1. Cek duplikasi member
  const existing = await db.query.members.findFirst({
    where(fields, op) {
      return or(
        op.eq(fields.phone, member.phone),
        member.email ? op.eq(fields.email, member.email) : undefined,
      );
    },
  });

  if (existing) {
    return c.json(
      { message: "Member dengan nomor telepon atau email ini sudah terdaftar." },
      HTTPStatusCode.CONFLICT,
    );
  }

  // 2. Validasi tanggal
  const parsedActiveSince = new Date(activeSince);
  const parsedActiveUntil = new Date(activeUntil);

  if (!activeSince) {
    issues.push({
      code: "missing_field",
      path: ["activeSince"],
      message: "Tanggal mulai tidak boleh kosong.",
    });
  }

  if (!activeUntil) {
    issues.push({
      code: "missing_field",
      path: ["activeUntil"],
      message: "Tanggal akhir tidak boleh kosong.",
    });
  }

  if (Number.isNaN(parsedActiveSince.getTime())) {
    issues.push({
      code: "invalid_date",
      path: ["activeSince"],
      message: "Format tanggal mulai tidak valid.",
    });
  }

  if (Number.isNaN(parsedActiveUntil.getTime())) {
    issues.push({
      code: "invalid_date",
      path: ["activeUntil"],
      message: "Format tanggal akhir tidak valid.",
    });
  }

  if (parsedActiveSince >= parsedActiveUntil) {
    issues.push({
      code: "date_order",
      path: ["activeUntil"],
      message: "Tanggal akhir harus lebih besar dari tanggal mulai.",
    });
  }

  // 3. Validasi branchIds
  const existingBranchIds = new Set(
    (await db.select({ id: branches.id }).from(branches)).map(b => b.id),
  );
  const invalidBranchIds = branchIds.filter(id => !existingBranchIds.has(id));

  if (invalidBranchIds.length > 0) {
    issues.push({
      code: "invalid_enum_value",
      path: ["branchIds"],
      message: `Branch ID tidak valid: ${invalidBranchIds.join(", ")}`,
    });
  }

  // 4. Return jika ada error
  if (issues.length > 0) {
    return validationError(c, issues);
  }

  // --- BEGIN INSERT DATA ---

  const [newMember] = await db.insert(members)
    .values({
      name: member.name,
      phone: member.phone,
      email: member.email ?? null,
    })
    .returning();

  const memberId: MemberId = newMember.id;

  const [card] = await db.insert(membershipCards)
    .values({ memberId })
    .returning();

  await db.insert(membershipCardBranches).values(
    branchIds.map(branchId => ({
      membershipCardId: card.id,
      branchId,
    })),
  );

  const [subscription] = await db.insert(subscriptions)
    .values({
      membershipCardId: card.id,
      activeSince: parsedActiveSince,
      activeUntil: parsedActiveUntil,
      createdBy,
    })
    .returning();

  await db.insert(subscriptionBranches).values(
    branchIds.map(branchId => ({
      subscriptionId: subscription.id,
      branchId,
    })),
  );

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

// DELETE /subscription/:id
export const deleteSubscription: AppRouteHandler<DeleteSubscriptionRoutes> = async (c) => {
  const { id } = c.req.valid("param");

  // Cek apakah subscription ada
  const existing = await db.query.subscriptions.findFirst({
    where(fields, op) {
      return op.eq(fields.id, id);
    },
  });

  if (!existing) {
    return c.json(
      { message: "Subscription tidak ditemukan" },
      HTTPStatusCode.NOT_FOUND,
    );
  }

  // Cek apakah sudah dihapus sebelumnya
  if (existing.deletedAt) {
    return c.json(
      { message: "Status Subscription Sudah Nonaktif (deletedAt != null)" },
      HTTPStatusCode.OK,
    );
  }

  // Soft delete
  await db
    .update(subscriptions)
    .set({ deletedAt: new Date() })
    .where(eq(subscriptions.id, id));

  return c.json(
    { message: "Subscription berhasil dihapus (soft delete)" },
    HTTPStatusCode.OK,
  );
};
