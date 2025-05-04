import { t, type Static } from "elysia";

export const WeatherAlertTypeEnum = t.UnionEnum([
  "flooding",
  "heavy_rain",
  "storm",
  "heat_wave",
  "cold_wave",
  "hurricane",
  "tornado",
  "drought",
  "general",
]);

export type WeatherAlertType = Static<typeof WeatherAlertTypeEnum>;

export const AlertSeverityEnum = t.UnionEnum([
  "low",
  "moderate",
  "high",
  "extreme",
]);

export type AlertSeverity = Static<typeof AlertSeverityEnum>;

export const WeatherAlertDataSchema = t.Object({
  severity: AlertSeverityEnum,
  location: t.String({ minLength: 1 }),
  description: t.String({ minLength: 1 }),
  startTime: t.Optional(t.String()),
  endTime: t.Optional(t.String()),
  precautions: t.Optional(t.Array(t.String())),
  imageUrl: t.Optional(t.String({ format: "uri" })),
  mapUrl: t.Optional(t.String({ format: "uri" })),
  temperature: t.Optional(t.Number()),
  precipitation: t.Optional(t.Number()),
  windSpeed: t.Optional(t.Number()),
  customMessage: t.Optional(t.String()),
});

export const WeatherAlertRequestSchema = t.Object({
  to: t.String({
    minLength: 10,
    pattern: "^\\+?[1-9]\\d{1,14}$",
    description: "Phone number in international format",
  }),
  alertType: WeatherAlertTypeEnum,
  data: WeatherAlertDataSchema,
});

// Schemas específicos para cada tipo de alerta
export const RainAlertSchema = t.Object({
  to: t.String({ minLength: 10 }),
  severity: AlertSeverityEnum,
  location: t.String(),
  description: t.Optional(t.String()),
  precipitation: t.Number({ minimum: 0 }),
  precautions: t.Optional(t.Array(t.String())),
  imageUrl: t.Optional(t.String({ format: "uri" })),
  startTime: t.Optional(t.String()),
  endTime: t.Optional(t.String()),
});

export const FloodAlertSchema = t.Object({
  to: t.String({ minLength: 10 }),
  severity: AlertSeverityEnum,
  location: t.String(),
  description: t.Optional(t.String()),
  precautions: t.Optional(t.Array(t.String())),
  imageUrl: t.Optional(t.String({ format: "uri" })),
  mapUrl: t.Optional(t.String({ format: "uri" })),
  affectedAreas: t.Optional(t.Array(t.String())),
  riverLevel: t.Optional(t.Number()),
});

export const HeatWaveAlertSchema = t.Object({
  to: t.String({ minLength: 10 }),
  severity: AlertSeverityEnum,
  location: t.String(),
  description: t.Optional(t.String()),
  temperature: t.Number(),
  feelsLike: t.Optional(t.Number()),
  humidity: t.Optional(t.Number()),
  precautions: t.Optional(t.Array(t.String())),
  imageUrl: t.Optional(t.String({ format: "uri" })),
  startTime: t.Optional(t.String()),
  endTime: t.Optional(t.String()),
});

export const StormAlertSchema = t.Object({
  to: t.String({ minLength: 10 }),
  severity: AlertSeverityEnum,
  location: t.String(),
  description: t.Optional(t.String()),
  windSpeed: t.Number({ minimum: 0 }),
  precipitation: t.Optional(t.Number()),
  lightningRisk: t.Optional(t.Boolean()),
  hailRisk: t.Optional(t.Boolean()),
  precautions: t.Optional(t.Array(t.String())),
  imageUrl: t.Optional(t.String({ format: "uri" })),
  startTime: t.Optional(t.String()),
  endTime: t.Optional(t.String()),
});

// Schema de resposta
export const WeatherAlertResponseSchema = t.Object({
  success: t.Boolean(),
  messageId: t.Optional(t.String()),
  error: t.Optional(t.String()),
});
