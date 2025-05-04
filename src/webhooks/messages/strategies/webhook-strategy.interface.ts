import type { WebhookEvent } from "../interfaces/webhook-types";

export interface IWebhookStategy {
  // valida o request
  validate(request: any, body: any): Promise<boolean>;
  // verifica se o evento é suportado
  parse(body: any): WebhookEvent;
  //Processa o evento
  process(event: WebhookEvent): Promise<void>;
  // Retorna o nome do provedor
  getName(): string;
}
