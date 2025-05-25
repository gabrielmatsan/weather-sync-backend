import { t } from "elysia";

export const pollutantType = t.Object({
  id: t.Number(),
  placeId: t.Number(),
  dataSourceId: t.Number(),
  dominantPollutant: t.String(),
  coConcentration: t.String(),
  coMetricUnit: t.String(),
});
