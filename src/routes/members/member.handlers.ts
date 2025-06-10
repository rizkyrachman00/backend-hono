import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";

import type { ListMemberRoutes } from "./member.routes.js";

export const list: AppRouteHandler<ListMemberRoutes> = async (c) => {
  const members = await db.query.members.findMany();
  return c.json(members);
};
