import * as HTTPStatusCode from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";
import { members } from "@/db/schema.js";

import type { CreateMemberRoutes, ListMemberRoutes } from "./member.routes.js";

export const list: AppRouteHandler<ListMemberRoutes> = async (c) => {
  const members = await db.query.members.findMany();
  return c.json(members);
};

export const create: AppRouteHandler<CreateMemberRoutes> = async (c) => {
  const member = c.req.valid("json");
  const [result] = await db.insert(members).values(member).returning();
  return c.json(result, HTTPStatusCode.OK);
};
