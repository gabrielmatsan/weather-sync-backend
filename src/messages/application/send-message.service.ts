import { env } from "@/shared/env/env";
import twilio from "twilio";

export interface floorWarningMessage {
  place: string;
  floor: string;
}

// Correção 2: Adicionar o prefixo whatsapp: ao número de origem
export class TwillioWhatsappService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }

  async sendWhatsAppMessage(to: string, info: floorWarningMessage) {
    const message = `ATENÇÃO!!!\n Alerta de enchente - Bairro ${info.place} - Nível da água ${info.floor}\n\n`;

    const result = await this.client.messages.create({
      from: `whatsapp:${env.TWILIO_PHONE_NUMBER}`,
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
