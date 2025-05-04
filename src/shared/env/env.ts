import { z } from "zod";

const envSchema = z.object({
  /**
   * VARIÁVEIS DA APLICAÇÃO
   */
  DATABASE_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_PORT: z.coerce.number().default(8080),
  JWT_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);
