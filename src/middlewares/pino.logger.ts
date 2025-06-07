import { pinoLogger as logger } from "hono-pino";
import { randomUUID } from "node:crypto";
import pino from "pino";
import pretty from "pino-pretty";

import env from "@/env.js";

export function pinoLogger() {
  return logger({
    pino: pino({
      level: env.LOG_LEVEL || "info",
    }, env.NODE_ENV === "production" ? undefined : pretty({ sync: true })),
    http: {
      reqId: () => randomUUID(),
    },
  });
}
