import { sendDailyReport } from "@/messages/application/send-daily-report.usecase";
import { sendFloorWarningMessageUseCase } from "@/messages/application/send-floor-warning-message.usecase";
import { repositories } from "@/shared/singleton/repositories";
import cron from "@elysiajs/cron";
import Elysia from "elysia";

export const CronJobs = new Elysia()
  .use(
    cron({
      name: "automated-flood-check",
      pattern: "0 */15 * * * *", // A cada 15 minutos
      timezone: "America/Belem",
      async run() {
        console.log(
          `[CRON] Verificando níveis de água em ${new Date().toISOString()}`
        );

        try {
          await sendFloorWarningMessageUseCase(
            repositories.sensorRepository,
            repositories.userRepository,
            repositories.placeRepository
          );

          console.log("[CRON] Verificação de enchentes concluída com sucesso");
        } catch (error) {
          console.error(
            "[CRON] Erro na verificação automática de enchentes:",
            error
          );
        }
      },
    })
  )
  .use(
    cron({
      name: "automated-daily-report",
      // a cada 24 horas
      pattern: "0 0 * * *",
      timezone: "America/Belem",
      async run() {
        try {
          console.log(
            `[CRON] Enviando relatório diário em ${new Date().toISOString()}`
          );

          await sendDailyReport(
            repositories.userRepository,
            repositories.weatherRepository,
            repositories.favoritePlaceRepository
          );
        } catch (error) {
          console.error(
            "[CRON] Erro no envio automático do relatório diário:",
            error
          );
        }
      },
    })
  )
  .use(
    cron({
      name: "cron-health-status",
      pattern: "*/5 * * * * *",
      timezone: "America/Belem",

      async run() {
        console.log(
          `[CRON] Verificando status de saúde em ${new Date().toISOString()}`
        );
      },
    })
  );
