export interface WebhookRequest {
  headers: Record<string, string | string[] | undefined>;
  body: any;
  query: Record<string, string | undefined>;
  method: string;
  url: string;
  path: string;
}

export interface MessageGatewayHandler {
  canHandle(request: any): Promise<boolean>;
  processMessage(messageData: any): Promise<void>;
}

export interface IWebhookDispatcher {
  /// Registra um gateway de mensagens
  registerHandler(handler: MessageGatewayHandler): void;
  // Despatcha o request para o handler apropriado
  dispatch(request: WebhookRequest): Promise<void>;
}

export class WebhookDispatcher implements IWebhookDispatcher {
  private handlers: MessageGatewayHandler[] = [];

  constructor(handlers: MessageGatewayHandler[]) {
    this.handlers = handlers;
  }
  registerHandler(handler: MessageGatewayHandler): void {
    this.handlers.push(handler);
  }
  async dispatch(request: WebhookRequest): Promise<void> {
    for (const handler of this.handlers) {
      if (await handler.canHandle(request)) {
        return await handler.processMessage(request);
      }
    }
    throw new Error("No handler found for the request");
  }
}
