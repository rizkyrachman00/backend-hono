import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";

import { pinoLogger } from "@/middlewares/pino.logger.js";

import type { AppBindings } from "./types.js";

export default function createApp() {
  const app = new OpenAPIHono<AppBindings>();

  app.use(serveEmojiFavicon("📝"));
  app.use(pinoLogger ());

  app.notFound(notFound);
  app.onError(onError);

  return app;
}
