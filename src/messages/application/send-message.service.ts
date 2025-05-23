import { env } from "@/shared/env/env";
import { messageFloodWarning } from "@/shared/utils/styles.messages";
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
        try {
            const message = messageFloodWarning(info.place, info.floor);

            const result = await this.client.messages.create({
                from: `whatsapp:${env.TWILIO_PHONE_NUMBER}`,
                to: `whatsapp:${to}`,
                body: message,
                // contentSid: env.TWILIO_TEMPLATE,
                // contentVariables: JSON.stringify({
                //   1: info.place,
                //   2: info.floor,
                // }),
            });

            if (!result) {
                throw new Error("Error sending message");
            }

            console.log("Message sent successfully", result.sid);
            return result;
        } catch (error) {
            console.error("Error sending message", error);
            throw new Error("Error sending message");
        }
    }
}
