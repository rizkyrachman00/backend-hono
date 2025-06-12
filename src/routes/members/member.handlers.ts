import * as HTTPStatusCode from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";
import { members } from "@/db/schema.js";

import type { CreateMemberRoutes, GetOneMemberRoutes, ListMemberRoutes } from "./member.routes.js";

export const list: AppRouteHandler<ListMemberRoutes> = async (c) => {
  const members = await db.query.members.findMany();
  return c.json(members);
};

export const create: AppRouteHandler<CreateMemberRoutes> = async (c) => {
  const member = c.req.valid("json");
  const [result] = await db.insert(members).values(member).returning();
  return c.json(result, HTTPStatusCode.OK);
};

export const getOne: AppRouteHandler<GetOneMemberRoutes> = async (c) => {
  const { id } = c.req.valid("param");
  const member = await db.query.members.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!member) {
    return c.json({ message: "Member not found." }, HTTPStatusCode.NOT_FOUND);
  }

  return c.json(member, HTTPStatusCode.OK);
};
