import { pinoLogger as logger } from "hono-pino";
import { randomUUID } from "node:crypto";
import * as pinoModule from "pino";
import pretty from "pino-pretty";

import env from "@/env.js";

const pino = (pinoModule as any).default || pinoModule;

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
