export interface WebhookEvent {
  id: string;
  type:
    | "message.received"
    | "message.sent"
    | "message.delivered"
    | "message.failed"
    | "unknown";
  timestamp: Date;
  provider: string;
  data: MessageData;
}

export interface MessageData {
  from: string;
  to: string;
  text?: string;
  mediaUrl?: string[];
  messageId: string;
  status?: string;
  raw?: any;
}
