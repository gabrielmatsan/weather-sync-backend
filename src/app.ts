import { env } from "@/shared/env";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";

const app = new Elysia({
  serve: {
    idleTimeout: 200,
  },
})
  .use(
    swagger({
      swaggerOptions: {
        deepLinking: true,
        withCredentials: true,
      },
      documentation: {
        servers: [
          {
            url: `http://localhost:${env.APP_PORT}`,
            description: "Local server",
          },
        ],
        info: {
          title: "Weather Sync",
          version: "1.0.0",
          description: "API documentation for Weather Sync",
        },
      },
      path: "/docs",
    })
  )
  .listen(env.APP_PORT);

export type app = typeof app;

console.log(`
  Weather Sync API
  Environment: ${env.NODE_ENV}
  Listening on: http://localhost:${env.APP_PORT}
  Documentation: http://localhost:${env.APP_PORT}/docs
  `);
