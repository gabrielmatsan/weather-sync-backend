import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

// 📊 Interfaces (mantidas)
export interface WeatherRecord {
  id: number;
  placeId: number;
  sourceId: number;
  temperature: string;
  humidity: number;
  pressure: number;
  windSpeed: string;
  windDirection: number;
  createdAt: Date;
}

export interface ChartData {
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
}

export interface WeatherSummary {
  min: number;
  max: number;
  average: number;
  city: string;
  totalRecords: number;
  dateRange: {
    start: string;
    end: string;
  };
  extremes: {
    maxWind: number;
    minPressure: number;
    maxPressure: number;
    avgHumidity: number;
  };
}

export interface PDFConfig {
  userName: string;
  userEmail: string;
  weatherData: WeatherRecord[];
  city?: string;
  logoPath?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    temperature?: string;
    humidity?: string;
    pressure?: string;
    wind?: string;
  };
  pageOptions?: {
    format?: "A4" | "Letter";
    orientation?: "portrait" | "landscape";
    margin?: {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
    };
  };
}

export interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  filePath?: string;
  fileSize: number;
  generationTime: number;
  chartCount: number;
  dataPoints: number;
  error?: string;
}

// 🏭 Classe principal ROBUSTA
export class GenerateWeatherPdfs {
  private assetCache = new Map<string, Buffer>();
  private readonly defaultColors = {
    primary: "#667eea",
    secondary: "#764ba2",
    temperature: "#f59e0b",
    humidity: "#3b82f6",
    pressure: "#8b5cf6",
    wind: "#dc2626",
  };

  /**
   * 🔄 Extrai e formata partes de data/hora
   */
  private extractDateParts(date: Date) {
    const days = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
    const months = [
      "JAN",
      "FEV",
      "MAR",
      "ABR",
      "MAI",
      "JUN",
      "JUL",
      "AGO",
      "SET",
      "OUT",
      "NOV",
      "DEZ",
    ];
    const timeZone = "America/Belem";

    return {
      dayNumber: date.getDate().toString().padStart(2, "0"),
      dayOfWeek: days[date.getDay()],
      month: months[date.getMonth()],
      year: date.getFullYear().toString(),
      time: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone,
      }),
      date: date.toLocaleDateString("pt-BR", { timeZone }),
      fullDateTime: date.toLocaleString("pt-BR", { timeZone }),
    };
  }

  /**
   * 📊 Transforma dados do banco para formato dos gráficos
   */
  private transformWeatherData(records: WeatherRecord[]): ChartData[] {
    return records.map((record) => {
      const dateParts = this.extractDateParts(record.createdAt);

      return {
        time: dateParts.time,
        temperature: parseFloat(record.temperature),
        humidity: record.humidity,
        pressure: record.pressure,
        windSpeed: parseFloat(record.windSpeed),
        windDirection: record.windDirection,
      };
    });
  }

  /**
   * 📈 Calcula estatísticas resumidas
   */
  private calculateSummary(
    data: ChartData[],
    city: string,
    records: WeatherRecord[]
  ): WeatherSummary {
    const temperatures = data.map((d) => d.temperature);
    const pressures = data.map((d) => d.pressure);
    const windSpeeds = data.map((d) => d.windSpeed);
    const humidities = data.map((d) => d.humidity);

    const sortedDates = records
      .map((r) => r.createdAt)
      .sort((a, b) => a.getTime() - b.getTime());

    const startDate = this.extractDateParts(sortedDates[0]);
    const endDate = this.extractDateParts(sortedDates[sortedDates.length - 1]);

    return {
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      average: Math.round(
        temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length
      ),
      city,
      totalRecords: data.length,
      dateRange: {
        start: startDate.fullDateTime,
        end: endDate.fullDateTime,
      },
      extremes: {
        maxWind: Math.max(...windSpeeds),
        minPressure: Math.min(...pressures),
        maxPressure: Math.max(...pressures),
        avgHumidity: Math.round(
          humidities.reduce((sum, h) => sum + h, 0) / humidities.length
        ),
      },
    };
  }

  /**
   * 🎨 Gera template HTML SIMPLIFICADO (sem dependências externas)
   */
  private generateSimplifiedHTML(
    config: PDFConfig,
    chartData: ChartData[],
    summary: WeatherSummary
  ): string {
    const colors = { ...this.defaultColors, ...config.customColors };
    const currentDate = this.extractDateParts(new Date());

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Dashboard - ${summary.city}</title>
    <style>
        @page {
            margin: 0;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: white;
            color: #333;
            line-height: 1.4;
            font-size: 12px;
        }
        
        .dashboard {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 15mm;
            background: white;
        }
        
        .header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 300;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }
        
        .summary-card .icon {
            font-size: 24px;
            margin-bottom: 12px;
        }
        
        .summary-card .title {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        
        .summary-card .value {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
            line-height: 1.2;
        }
        
        .chart-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .chart-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .simple-chart {
            background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            height: 200px;
            position: relative;
            overflow: hidden;
        }
        
        .chart-bars {
            display: flex;
            align-items: end;
            height: 150px;
            gap: 4px;
            margin: 20px 0;
        }
        
        .bar {
            flex: 1;
            background: ${colors.temperature};
            border-radius: 2px 2px 0 0;
            min-height: 5px;
            position: relative;
        }
        
        .bar:nth-child(even) {
            background: ${colors.humidity};
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }
        
        .data-table th,
        .data-table td {
            border: 1px solid #e2e8f0;
            padding: 12px 8px;
            text-align: center;
        }
        
        .data-table th {
            background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
            font-weight: 600;
            color: #374151;
            font-size: 11px;
        }
        
        .data-table tbody tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 10px;
        }
        
        .dashboard-ready {
            opacity: 1;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <!-- Header -->
        <div class="header">
            <h1>🌤️ Weather Dashboard</h1>
            <p>Relatório meteorológico para <strong>${config.userName}</strong> • ${summary.city}</p>
            <p>Período: ${summary.dateRange.start} → ${summary.dateRange.end} • ${summary.totalRecords} registros coletados</p>
            <p>${currentDate.dayOfWeek}, ${currentDate.dayNumber} ${currentDate.month} ${currentDate.year}</p>
        </div>

        <!-- Cards de resumo -->
        <div class="summary-grid">
            <div class="summary-card">
                <div class="icon">🌡️</div>
                <div class="title">Temperatura</div>
                <div class="value">${summary.min}° - ${summary.max}°C<br>
                    <small style="font-size: 12px; font-weight: normal; color: #64748b;">Média: ${summary.average}°C</small>
                </div>
            </div>
            <div class="summary-card">
                <div class="icon">💧</div>
                <div class="title">Umidade</div>
                <div class="value">${summary.extremes.avgHumidity}%<br>
                    <small style="font-size: 12px; font-weight: normal; color: #64748b;">Média geral</small>
                </div>
            </div>
            <div class="summary-card">
                <div class="icon">📊</div>
                <div class="title">Pressão</div>
                <div class="value">${summary.extremes.minPressure} - ${summary.extremes.maxPressure}<br>
                    <small style="font-size: 12px; font-weight: normal; color: #64748b;">hPa</small>
                </div>
            </div>
            <div class="summary-card">
                <div class="icon">💨</div>
                <div class="title">Vento Máximo</div>
                <div class="value">${summary.extremes.maxWind.toFixed(1)}<br>
                    <small style="font-size: 12px; font-weight: normal; color: #64748b;">km/h</small>
                </div>
            </div>
        </div>

        <!-- Gráfico Simples de Temperatura -->
        <div class="chart-section">
            <h3 class="chart-title">
                <span>📈</span>
                Gráfico de Temperaturas
            </h3>
            <div class="simple-chart">
                <div class="chart-bars">
                    ${this.generateSimpleBars(chartData, "temperature", summary.min, summary.max)}
                </div>
                <div style="font-size: 10px; color: #64748b; text-align: center;">
                    Temperaturas ao longo do dia (${chartData.length} medições)
                </div>
            </div>
        </div>

        <!-- Gráfico Simples de Umidade -->
        <div class="chart-section">
            <h3 class="chart-title">
                <span>💧</span>
                Gráfico de Umidade
            </h3>
            <div class="simple-chart">
                <div class="chart-bars">
                    ${this.generateSimpleBars(chartData, "humidity", 0, 100)}
                </div>
                <div style="font-size: 10px; color: #64748b; text-align: center;">
                    Umidade relativa do ar (${chartData.length} medições)
                </div>
            </div>
        </div>

        <!-- Tabela de dados -->
        <div class="chart-section">
            <h3 class="chart-title">
                <span>📋</span>
                Registros Detalhados (${summary.totalRecords} leituras)
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Horário</th>
                        <th>Temperatura (°C)</th>
                        <th>Umidade (%)</th>
                        <th>Pressão (hPa)</th>
                        <th>Vento (km/h)</th>
                        <th>Direção (°)</th>
                    </tr>
                </thead>
                <tbody>
                    ${chartData
                      .map(
                        (d) => `
                        <tr>
                            <td style="font-weight: 600;">${d.time}</td>
                            <td style="color: ${colors.temperature}; font-weight: 600;">${d.temperature}°</td>
                            <td style="color: ${colors.humidity};">${d.humidity}%</td>
                            <td style="color: ${colors.pressure};">${d.pressure}</td>
                            <td style="color: ${colors.wind};">${d.windSpeed}</td>
                            <td>${d.windDirection}°</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Weather Dashboard v2.0</strong></p>
            <p>Gerado para ${config.userName} (${config.userEmail})</p>
            <p>Data de geração: ${currentDate.fullDateTime}</p>
            <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                © ${currentDate.year} Weather Dashboard • Relatório gerado automaticamente dos sensores de ${summary.city}
            </p>
        </div>

        <!-- Marcador de conclusão -->
        <div class="dashboard-ready">Ready</div>
    </div>
</body>
</html>`;
  }

  /**
   * 📊 Gera barras simples para gráfico CSS
   */
  private generateSimpleBars(
    data: ChartData[],
    field: keyof ChartData,
    min: number,
    max: number
  ): string {
    const range = max - min || 1;

    return data
      .map((d) => {
        const value = typeof d[field] === "number" ? d[field] : 0;
        const percentage = ((value - min) / range) * 100;
        const height = Math.max(5, percentage); // Mínimo 5% de altura

        return `<div class="bar" style="height: ${height}%" title="${field}: ${value}"></div>`;
      })
      .join("");
  }

  /**
   * 📄 Gera PDF usando Puppeteer - VERSÃO ROBUSTA
   */
  private async generatePDF(
    config: PDFConfig,
    chartData: ChartData[],
    summary: WeatherSummary
  ): Promise<Buffer> {
    // ✅ CONFIGURAÇÃO ROBUSTA DO PUPPETEER
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-default-apps",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-features=TranslateUI",
        "--disable-web-security",
        "--allow-running-insecure-content",
      ],
      timeout: 60000,
      protocolTimeout: 60000,
    });

    try {
      const page = await browser.newPage();

      // ✅ CONFIGURAÇÃO ROBUSTA DA PÁGINA
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 1,
      });

      // ✅ USAR HTML SIMPLIFICADO (sem dependências externas)
      const htmlContent = this.generateSimplifiedHTML(
        config,
        chartData,
        summary
      );

      await page.setContent(htmlContent, {
        waitUntil: "domcontentloaded", // ✅ Mais rápido que networkidle0
        timeout: 30000,
      });

      // ✅ AGUARDAR RENDERIZAÇÃO SIMPLES
      await page.waitForSelector(".dashboard-ready", { timeout: 15000 });

      // ✅ ESPERA ADICIONAL MAIS CURTA
      await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 1000); // ✅ Reduzido para 1 segundo
        });
      });

      console.log("✅ Página renderizada, iniciando geração do PDF...");

      // ✅ CONFIGURAÇÃO ROBUSTA DO PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "10mm",
          bottom: "10mm",
          left: "10mm",
          right: "10mm",
        },
        preferCSSPageSize: false, // ✅ Importante para compatibilidade
        displayHeaderFooter: false,
        scale: 1,
        timeout: 30000, // ✅ Timeout específico para PDF
      });

      console.log(
        `✅ PDF gerado com sucesso: ${Math.round(pdfBuffer.length / 1024)}KB`
      );
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error("❌ Erro detalhado na geração do PDF:", {});
      throw error;
    } finally {
      await browser.close();
    }
  }

  /**
   * 🚀 Método principal de execução
   */
  public async execute(config: PDFConfig): Promise<PDFGenerationResult> {
    const startTime = Date.now();

    try {
      console.log(`📊 Iniciando geração de PDF para ${config.userName}...`);

      // Validações
      if (!config.weatherData || config.weatherData.length === 0) {
        throw new Error("Dados meteorológicos não fornecidos ou vazios");
      }

      // Transformar dados
      const chartData = this.transformWeatherData(config.weatherData);
      console.log(`🔄 ${chartData.length} registros transformados`);

      // Calcular estatísticas
      const summary = this.calculateSummary(
        chartData,
        config.city || "Localização",
        config.weatherData
      );
      console.log(
        `📈 Estatísticas calculadas: ${summary.min}° - ${summary.max}°C`
      );

      // Gerar PDF
      const pdfBuffer = await this.generatePDF(config, chartData, summary);
      const generationTime = Date.now() - startTime;

      console.log(`✅ PDF gerado com sucesso em ${generationTime}ms`);
      console.log(`📄 Tamanho: ${Math.round(pdfBuffer.length / 1024)}KB`);

      return {
        success: true,
        pdfBuffer,
        fileSize: pdfBuffer.length,
        generationTime,
        chartCount: 2, // Temperatura e Umidade
        dataPoints: chartData.length,
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;
      console.error(`❌ Erro na geração do PDF:`, error);

      return {
        success: false,
        fileSize: 0,
        generationTime,
        chartCount: 0,
        dataPoints: 0,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * 💾 Salva PDF em arquivo (opcional)
   */
  public async saveToFile(
    config: PDFConfig,
    outputPath?: string
  ): Promise<PDFGenerationResult & { filePath?: string }> {
    const result = await this.execute(config);

    if (result.success && result.pdfBuffer) {
      try {
        const fileName =
          outputPath ||
          `weather-dashboard-${config.city || "report"}-${new Date().toISOString().split("T")[0]}.pdf`;

        await fs.writeFile(fileName, result.pdfBuffer);
        console.log(`💾 PDF salvo em: ${fileName}`);

        return {
          ...result,
          filePath: fileName,
        };
      } catch (error) {
        console.error(`❌ Erro ao salvar PDF:`, error);
        return {
          ...result,
          error: `Geração bem-sucedida, mas falha ao salvar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        };
      }
    }

    return result;
  }

  /**
   * 🔧 Limpa cache de assets
   */
  public clearAssetCache(): void {
    this.assetCache.clear();
    console.log("🧹 Cache de assets limpo");
  }

  /**
   * 📊 Obtém informações do cache
   */
  public getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.assetCache.size,
      keys: Array.from(this.assetCache.keys()),
    };
  }

  /**
   * 🎨 Configuração padrão para facilitar uso
   */
  public static createDefaultConfig(
    userName: string,
    userEmail: string,
    weatherData: WeatherRecord[],
    city: string = "Belém"
  ): PDFConfig {
    return {
      userName,
      userEmail,
      weatherData,
      city,
      customColors: {
        primary: "#667eea",
        secondary: "#764ba2",
        temperature: "#f59e0b",
        humidity: "#3b82f6",
        pressure: "#8b5cf6",
        wind: "#dc2626",
      },
      pageOptions: {
        format: "A4",
        orientation: "portrait",
        margin: {
          top: "10mm",
          bottom: "10mm",
          left: "10mm",
          right: "10mm",
        },
      },
    };
  }
}

// 🚀 Serviço simplificado ROBUSTO
export class WeatherDashboardService {
  private pdfGenerator: GenerateWeatherPdfs;

  constructor() {
    this.pdfGenerator = new GenerateWeatherPdfs();
  }

  /**
   * 📧 Método principal ROBUSTO
   */
  public async generateDashboardForUser(
    userName: string,
    userEmail: string,
    weatherRecords: WeatherRecord[],
    city: string,
    options?: {
      saveToFile?: boolean;
      outputPath?: string;
      customColors?: PDFConfig["customColors"];
    }
  ): Promise<PDFGenerationResult> {
    console.log(`📊 Gerando dashboard para ${userName} (${userEmail})`);

    const config: PDFConfig = {
      userName,
      userEmail,
      weatherData: weatherRecords,
      city,
      customColors: options?.customColors,
      pageOptions: {
        format: "A4",
        orientation: "portrait",
        margin: {
          top: "12mm",
          bottom: "12mm",
          left: "12mm",
          right: "12mm",
        },
      },
    };

    try {
      // Gerar PDF
      const result = options?.saveToFile
        ? await this.pdfGenerator.saveToFile(config, options.outputPath)
        : await this.pdfGenerator.execute(config);

      if (result.success) {
        console.log(`✅ Dashboard gerado para ${userName}`);
        console.log(
          `📊 Dados: ${result.dataPoints} pontos, ${result.chartCount} gráficos`
        );
        console.log(`⏱️ Tempo: ${result.generationTime}ms`);
        console.log(`📄 Tamanho: ${Math.round(result.fileSize / 1024)}KB`);
      } else {
        console.error(`❌ Falha na geração para ${userName}: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error(`💥 Erro crítico para ${userName}:`, error);

      return {
        success: false,
        fileSize: 0,
        generationTime: 0,
        chartCount: 0,
        dataPoints: 0,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * 🧹 Limpeza de recursos
   */
  public cleanup(): void {
    this.pdfGenerator.clearAssetCache();
  }

  /**
   * 📊 Informações do sistema
   */
  public getSystemInfo(): object {
    return {
      cacheInfo: this.pdfGenerator.getCacheInfo(),
      timestamp: new Date().toISOString(),
      version: "2.0.2-robust",
    };
  }
}
