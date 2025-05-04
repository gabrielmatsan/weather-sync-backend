export interface MessageSender {
  sendMessage(
    to: string,
    message: string,
    mediaUrl?: string[]
  ): Promise<MessageResult>;
  sendTemplate(
    to: string,
    templateId: string,
    params?: Record<string, string>
  ): Promise<MessageResult>;
  getMessageStatus(messageId: string): Promise<MessageStatus>;
}

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
}

export interface MessageStatus {
  messageId: string;
  status: "queued" | "sent" | "delivered" | "failed" | "read";
  timestamp: Date;
  error?: string;
}

