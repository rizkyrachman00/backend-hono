import createApp from "./lib/create.app.js";

const app = createApp();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/error", (c) => {
  c.status(422);
  c.var.logger.debug("Only visible when LOG_LEVEL=debug");
  throw new Error("Oh No!");
});

export default app;
