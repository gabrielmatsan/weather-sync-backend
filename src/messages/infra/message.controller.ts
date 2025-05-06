import Elysia from "elysia";

import { services } from "@/shared/singleton/services";
import { sendMessageSchema } from "../application/send-message.service";

export const MessageController = new Elysia({
  prefix: "/messages",
  tags: ["Messages"],
}) // Enviar mensagem individual
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const { to, place, floor } = body;

        const result =
          await services.twilionWhatsappService.sendWhatsAppMessage(to, {
            place,
            floor,
          });

        set.status = 201;
        return {
          success: true,
          message: "Message sent successfully",
          data: {
            messageId: result.sid,
            to: result.to,
            status: result.status,
          },
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
      body: sendMessageSchema,
      detail: {
        summary: "Send flood alert message",
        description: "Send a WhatsApp flood alert to a single recipient",
      },
    }
  );
