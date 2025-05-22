import { cron } from "@elysiajs/cron";
import Elysia from "elysia";

import { repositories } from "@/shared/singleton/repositories";
import { sendFloorWarningMessageUseCase } from "../application/send-floor-warning-message.usecase";

export const MessageController = new Elysia({
    prefix: "/messages",
    tags: ["Messages"],
})
    //rota apenas para o teste de integração
    .post(
        "/send-floor-warning",
        async ({ set }) => {
            try {
                await sendFloorWarningMessageUseCase(
                    repositories.sensorRepository,
                    repositories.userRepository,
                    repositories.placeRepository,
                );

                set.status = 201;
                return {
                    success: true,
                    message: "Message sent successfully",
                };
            } catch (error) {
                console.error("Error sending message:", error);
                set.status = 500;
                return {
                    success: false,
                    message: "Failed to send message",
                };
            }
        },
        {
            detail: {
                summary: "Send flood alert message",
                description: "Send a WhatsApp flood alert to a single recipient",
            },
        },
    )
    .use(
        cron({
            name: "automated-flood-check",
            pattern: "0 */15 * * * *", // A cada 15 minutos
            timezone: "America/Belem",
            async run() {
                console.log(`[CRON] Verificando níveis de água em ${new Date().toISOString()}`);

                try {
                    await sendFloorWarningMessageUseCase(
                        repositories.sensorRepository,
                        repositories.userRepository,
                        repositories.placeRepository,
                    );

                    console.log("[CRON] Verificação de enchentes concluída com sucesso");
                } catch (error) {
                    console.error("[CRON] Erro na verificação automática de enchentes:", error);
                }
            },
        }),
    )
    .use(
        cron({
            name: "cron-health-status",
            pattern: "*/5 * * * * *",
            timezone: "America/Belem",

            async run() {
                console.log(`[CRON] Verificando status de saúde em ${new Date().toISOString()}`);
            },
        }),
    );
