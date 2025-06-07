import { pinoLogger as honoPinoLogger } from "hono-pino";

export function pinoLogger() {
  return honoPinoLogger();
}
