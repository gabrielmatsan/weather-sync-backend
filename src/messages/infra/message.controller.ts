import Elysia from "elysia";

import { repositories } from "@/shared/singleton/repositories";
import { sendFloorWarningMessageUseCase } from "../application/send-floor-warning-message.usecase";

export const MessageController = new Elysia({
  prefix: "/messages",
  tags: ["Messages"],
}) // Enviar mensagem individual
  .post(
    "/send-floor-warning",
    async ({ set }) => {
      try {
        await sendFloorWarningMessageUseCase(
          repositories.sensorRepository,
          repositories.userRepository,
          repositories.placeRepository
        );

        // const result =
        //   await services.twilionWhatsappService.sendWhatsAppMessage(to, {
        //     place,
        //     floor,
        //   });

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
