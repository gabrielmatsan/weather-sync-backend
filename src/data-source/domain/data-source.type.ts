import { t } from "elysia";

/**
 * pollutants
weather
air quality
 */

export const dataSourceType = t.Object({
  id: t.Number(),
  name: t.String(),
});
