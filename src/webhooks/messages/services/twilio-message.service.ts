import { env } from "@/shared/env/env";
import twilio from "twilio";
import type {
  MessageResult,
  MessageSender,
  MessageStatus,
} from "../interfaces/message-sender.interface";

export class TwilioMessageService implements MessageSender {
  private client: twilio.Twilio;
  private whatsappNumber: string;

  constructor() {
    this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    this.whatsappNumber = env.TWILIO_PHONE_NUMBER;
  }

  async sendMessage(
    to: string,
    message: string,
    mediaUrl?: string[]
  ): Promise<MessageResult> {
    try {
      const toWhatsapp = this.formatPhoneNumber(to);

      const result = await this.client.messages.create({
        from: this.whatsappNumber,
        to: toWhatsapp,
        body: message,
        ...(mediaUrl && { mediaUrl }),
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
      };
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async sendTemplate(
    to: string,
    templateId: string,
    params?: Record<string, string>
  ): Promise<MessageResult> {
    try {
      const toWhatsapp = this.formatPhoneNumber(to);

      const result = await this.client.messages.create({
        from: this.whatsappNumber,
        to: toWhatsapp,
        contentSid: templateId,
        contentVariables: JSON.stringify(params || {}),
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status,
      };
    } catch (error) {
      console.error("Error sending WhatsApp template:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    try {
      const message = await this.client.messages(messageId).fetch();

      return {
        messageId: message.sid,
        status: this.mapTwilioStatus(message.status),
        timestamp: message.dateUpdated || message.dateCreated,
        ...(message.errorCode && { error: message.errorMessage }),
      };
    } catch (error) {
      console.error("Error getting message status:", error);
      throw new Error(
        `Failed to get message status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Se já tem o prefixo whatsapp:, retorna como está
    if (phone.startsWith("whatsapp:")) {
      return phone;
    }

    // Se não tem o prefixo, adiciona
    // Remove qualquer caractere não numérico, exceto o +
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    // Se não começa com +, assume que é um número brasileiro e adiciona +55
    const formattedPhone = cleanPhone.startsWith("+")
      ? cleanPhone
      : `+55${cleanPhone}`;

    return `whatsapp:${formattedPhone}`;
  }

  private mapTwilioStatus(twilioStatus: string): MessageStatus["status"] {
    const statusMap: Record<string, MessageStatus["status"]> = {
      queued: "queued",
      sending: "sent",
      sent: "sent",
      delivered: "delivered",
      undelivered: "failed",
      failed: "failed",
      read: "read",
      receiving: "sent",
      received: "delivered",
    };

    return statusMap[twilioStatus.toLowerCase()] || "queued";
  }
}
