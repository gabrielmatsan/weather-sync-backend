import { env } from "@/shared/env/env";
import { t } from "elysia";
import twilio from "twilio";

export interface floorWarningMessage {
  place: string;
  floor: string;
}

export const sendMessageSchema = t.Object({
  to: t.String({
    minLength: 10,
    maxLength: 15,
    description: "Phone number with country code (e.g., +5591988772828)",
  }),
  place: t.String({
    minLength: 1,
    description: "Location name",
  }),
  floor: t.String({
    minLength: 1,
    description: "Water level",
  }),
});

// Correção 2: Adicionar o prefixo whatsapp: ao número de origem
export class TwillioWhatsappService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }

  async sendWhatsAppMessage(to: string, info: floorWarningMessage) {
    const message = `ATENÇÃO!!!\n Alerta de enchente - Bairro ${info.place} - Nível da água ${info.floor}\n\n`;

    const result = await this.client.messages.create({
      from: `whatsapp:${env.TWILIO_PHONE_NUMBER}`, // Adicionar whatsapp: aqui
      to: `whatsapp:${to}`,
      body: message,
    });

    if (!result) {
      throw new Error("Error sending message");
    }

    console.log("Message sent successfully", result.sid);
    return result;
  }
}
