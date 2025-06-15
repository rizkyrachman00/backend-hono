import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";

import type { ListVisitLogRoutes } from "./visit-log.routes.js";

export const list: AppRouteHandler<ListVisitLogRoutes> = async (c) => {
  const logs = await db.query.visitLogs.findMany();
  return c.json(logs);
};
