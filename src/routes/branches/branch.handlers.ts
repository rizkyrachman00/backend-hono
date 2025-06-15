import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";

import type { ListBranchRoutes } from "./branch.routes.js";

export const list: AppRouteHandler<ListBranchRoutes> = async (c) => {
  const branches = await db.query.branches.findMany();
  return c.json(branches);
};
