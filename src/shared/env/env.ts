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
  BASE_URL: z.string().optional().default("http://localhost:8080"),

  /**
   * TWILIO ENVIROMENTS
   */
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),
  TWILIO_TEMPLATE: z.string().min(1),
});

export const env = envSchema.parse(process.env);
