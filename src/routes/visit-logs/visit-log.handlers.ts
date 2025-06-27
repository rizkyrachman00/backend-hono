import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types.js";

import db from "@/db/index.js";
import {
  branches,
  guests,
  members,
  visitLogs,
} from "@/db/schema.js";

import type { ListVisitLogRoutes } from "./visit-log.routes.js";

export const list: AppRouteHandler<ListVisitLogRoutes> = async (c) => {
  const logs = await db
    .select({
      id: visitLogs.id,
      type: visitLogs.type,
      checkinAt: visitLogs.createdAt,
      member: {
        id: members.id,
        name: members.name,
        phone: members.phone,
        email: members.email,
      },
      guest: {
        id: guests.id,
        name: guests.name,
        phone: guests.phone,
      },
      branch: {
        id: branches.id,
        name: branches.name,
      },
    })
    .from(visitLogs)
    .leftJoin(members, eq(visitLogs.memberId, members.id))
    .leftJoin(guests, eq(visitLogs.guestId, guests.id))
    .leftJoin(branches, eq(visitLogs.branchId, branches.id));

  const formatted = logs.map(log => ({
    id: log.id,
    type: log.type,
    checkinAt: log.checkinAt,
    user: log.type === "member"
      ? {
          id: log.member?.id,
          name: log.member?.name,
          phone: log.member?.phone,
          email: log.member?.email,
        }
      : {
          id: log.guest?.id,
          name: log.guest?.name,
          phone: log.guest?.phone,
        },
    branch: log.branch,
  }));

  return c.json(formatted);
};
