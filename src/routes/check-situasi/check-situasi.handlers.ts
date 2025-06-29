import { between, isNull, sql } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";
import {
  branches,
  visitLogs,
} from "@/db/schema.js";

import type { CheckSituasiRoute } from "./check-situasi.routes.js";

// GET /visit-logs/check-situasi
export const checkSituasi: AppRouteHandler<CheckSituasiRoute> = async (c) => {
  const end = new Date();
  const start = new Date(end.getTime() - 2 * 60 * 60 * 1000); // Kurangi 2 jam

  // Ambil semua branch yang tidak dihapus
  const allBranches = await db.query.branches.findMany({
    where: isNull(branches.deletedAt),
  });

  // Hitung jumlah visitor untuk masing-masing branch dalam rentang waktu
  const rawCounts = await db
    .select({
      branchId: visitLogs.branchId,
      visitorCount: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(between(visitLogs.createdAt, start, end))
    .groupBy(visitLogs.branchId);

  // Buat map dari branchId ke visitorCount
  const countMap = new Map(
    rawCounts.map(row => [row.branchId, row.visitorCount]),
  );

  // Gabungkan dengan data branch
  const result = allBranches.map(branch => ({
    branch: {
      id: branch.id,
      identifier: branch.identifier,
      name: branch.name,
    },
    visitorCount: Number(countMap.get(branch.id) ?? 0),
  }));

  return c.json(result);
};
