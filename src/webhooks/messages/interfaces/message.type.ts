export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  mediaUrl?: string[];
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
  provider: string;
  metadata?: Record<string, any>;
}

export type MessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "failed"
  | "read";

export interface CreateMessageDto {
  to: string;
  content: string;
  mediaUrl?: string[];
  metadata?: Record<string, any>;
}
