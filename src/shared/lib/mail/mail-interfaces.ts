import type { User } from "@/users/domain/users.type";
import type {
  ChartData,
  WeatherRecord,
  WeatherSummary,
} from "../generate-pdfs";

export interface EmailGenerateStrategy {
  generateEmail(data: EmailGenerationData): Promise<EmailResult>;
  getType(): string;
}

export interface EmailResult {
  html: string;
  text: string;
  attachments?: EmailAttachment[];
  metadata: EmailMetadata;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface EmailMetadata {
  generationTime: number;
  fileSize: number;
  technology: string;
  chartCount?: number;
}

export interface UserPreferences {
  format: "PDF" | "HTML";
  includeCharts: boolean;
  language: "pt-BR" | "en-US";
}

export interface EmailGenerationData {
  user: User;
  weatherData: WeatherRecord[];
  chartData: ChartData[];
  summary: WeatherSummary;
  config: GenerationConfig;
}

export interface GenerationConfig {
  saveFiles?: boolean;
  outputDir?: string;
  customColors?: ColorScheme;
  logoPath?: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  temperature: string;
  humidity: string;
  pressure: string;
  wind: string;
}
