import { between, isNull, sql } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";
import { branches, visitLogs } from "@/db/schema.js";

import type { CheckSituasiRoute } from "./check-situasi.routes.js";

// GET /visit-logs/check-situasi
export const checkSituasi: AppRouteHandler<CheckSituasiRoute> = async (c) => {
  // Ambil semua branch yang tidak dihapus
  const allBranches = await db.query.branches.findMany({
    where: isNull(branches.deletedAt),
  });

  // Hitung jumlah visitor dalam 2 jam terakhir berdasarkan waktu database
  const rawCounts = await db
    .select({
      branchId: visitLogs.branchId,
      visitorCount: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(
      between(
        visitLogs.createdAt,
        sql`now() - interval '2 hours'`,
        sql`now()`,
      ),
    )
    .groupBy(visitLogs.branchId);

  // Buat map branchId → jumlah pengunjung
  const countMap = new Map(
    rawCounts.map(row => [row.branchId, row.visitorCount]),
  );

  // Gabungkan data branch dan jumlah pengunjung
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
