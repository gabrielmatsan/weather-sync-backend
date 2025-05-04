// src/webhooks/strategies/twilio-webhook.strategy.ts
import twilio from "twilio";
import type { MessageSender } from "../interfaces/message-sender.interface";
import type { WebhookEvent } from "../interfaces/webhook-types";
import type { IWebhookStategy } from "./webhook-strategy.interface";

export class TwilioWebhookStrategy implements IWebhookStategy {
  constructor(
    private authToken: string,
    private baseUrl: string,
    private messageSender: MessageSender
  ) {}

  getName(): string {
    return "twilio";
  }

  async validate(request: Request, body: any): Promise<boolean> {
    const signature = request.headers.get("X-Twilio-Signature");
    if (!signature) return false;

    const url = `${this.baseUrl}${new URL(request.url).pathname}`;
    const params = this.flattenBody(body);

    return twilio.validateRequest(this.authToken, signature, url, params);
  }

  parse(body: any): WebhookEvent {
    const eventType = this.determineEventType(body);

    return {
      id: body.MessageSid || body.SmsSid || crypto.randomUUID(),
      type: eventType,
      timestamp: new Date(),
      provider: this.getName(),
      data: {
        from: body.From,
        to: body.To,
        text: body.Body,
        mediaUrl: body.MediaUrl ? [body.MediaUrl] : undefined,
        messageId: body.MessageSid || body.SmsSid,
        status: body.SmsStatus || body.MessageStatus,
        raw: body,
      },
    };
  }

  async process(event: WebhookEvent): Promise<void> {
    console.log(`[Twilio] Processing ${event.type} event`);

    switch (event.type) {
      case "message.received":
        await this.handleMessageReceived(event);
        break;
      case "message.sent":
        await this.handleMessageSent(event);
        break;
      case "message.delivered":
        await this.handleMessageDelivered(event);
        break;
      case "message.failed":
        await this.handleMessageFailed(event);
        break;
      default:
        console.log(`[Twilio] Unknown event type: ${event.type}`);
    }
  }

  private flattenBody(body: any): Record<string, string> {
    const flattened: Record<string, string> = {};

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string" || typeof value === "number") {
        flattened[key] = String(value);
      }
    }

    return flattened;
  }

  private determineEventType(body: any): WebhookEvent["type"] {
    if (body.SmsStatus) {
      switch (body.SmsStatus) {
        case "sent":
          return "message.sent";
        case "delivered":
          return "message.delivered";
        case "failed":
        case "undelivered":
          return "message.failed";
      }
    }

    // Se não tem status, assume que é mensagem recebida
    return body.Body ? "message.received" : "unknown";
  }

  private async handleMessageReceived(event: WebhookEvent): Promise<void> {
    console.log(
      `[Twilio] Message received from ${event.data.from}: ${event.data.text}`
    );

    // Estrutura preparada para futuras implementações de resposta automática
    // Por enquanto, apenas registra o recebimento

    // TODO: Implementar lógica de resposta automática quando necessário
    // Exemplo de estrutura para futura implementação:
    // - Processamento de comandos
    // - Respostas automáticas
    // - Integração com chatbot
    // - Encaminhamento para operadores
  }

  private async handleMessageSent(event: WebhookEvent): Promise<void> {
    console.log(
      `[Twilio] Message sent to ${event.data.to} - ID: ${event.data.messageId}`
    );
    // Webhook chamado quando uma mensagem é enviada com sucesso
  }

  private async handleMessageDelivered(event: WebhookEvent): Promise<void> {
    console.log(
      `[Twilio] Message delivered to ${event.data.to} - ID: ${event.data.messageId}`
    );
    // Webhook chamado quando uma mensagem é entregue ao destinatário
  }

  private async handleMessageFailed(event: WebhookEvent): Promise<void> {
    console.error(
      `[Twilio] Message failed to ${event.data.to} - ID: ${event.data.messageId}`
    );
    // Webhook chamado quando uma mensagem falha no envio

    // TODO: Implementar lógica de retry ou notificação de erro quando necessário
  }
}
