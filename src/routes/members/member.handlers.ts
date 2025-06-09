import type { AppRouteHandler } from "@/lib/types.js";

import type { ListMemberRoutes } from "./member.routes.js";

export const list: AppRouteHandler<ListMemberRoutes> = (c) => {
  return c.json([
    { name: "John Doe", done: false },
  ]);
};
