import Elysia from "elysia";

import { repositories } from "@/shared/singleton/repositories";
import { sendDailyReport } from "../application/send-daily-report.usecase";
import { sendFloorWarningMessageUseCase } from "../application/send-floor-warning-message.usecase";

// Rotas apenas para os testes de integração
export const MessageController = new Elysia({
  prefix: "/messages",
  tags: ["Messages"],
})
  .post("send-daily-report", async ({ set }) => {
    try {
      await sendDailyReport(
        repositories.userRepository,
        repositories.weatherRepository,
        repositories.favoritePlaceRepository
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
  })
  .post(
    "/send-floor-warning",
    async ({ set }) => {
      try {
        await sendFloorWarningMessageUseCase(
          repositories.sensorRepository,
          repositories.userRepository,
          repositories.placeRepository
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
    }
  );
