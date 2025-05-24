import type { Weather } from "@/weather/domain/weather.type";

export interface WeatherChartData {
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  timestamp: number;
}

export interface ChartConfig {
  width: number;
  height: number;
  showGrid?: boolean;
  showLegend?: boolean;
  colors: {
    temperature: string;
    humidity: string;
    pressure: string;
    wind: string;
    grid: string;
    text: string;
  };
}

// services/weather-chart-generator.ts
export class WeatherChartGenerator {
  // Converter dados do banco para formato do gráfico
  static transformData(weatherData: Weather[]): WeatherChartData[] {
    return weatherData
      .filter((w) => w.createdAt !== null)
      .map((weather) => ({
        time: new Date(weather.createdAt!).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: parseFloat(weather.temperature) || 0,
        humidity: weather.humidity || 0,
        pressure: weather.pressure || 1013,
        windSpeed: parseFloat(weather.windSpeed) || 0,
        windDirection: weather.windDirection || 0,
        timestamp: new Date(weather.createdAt!).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  // 1. GRÁFICO MULTI-LINHA: Temperatura + Umidade + Pressão
  static generateMultiLineChart(
    data: WeatherChartData[],
    config: ChartConfig
  ): string {
    if (data.length === 0) return "";

    const { width, height, colors } = config;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Normalizar dados para diferentes escalas
    const tempMin = Math.min(...data.map((d) => d.temperature));
    const tempMax = Math.max(...data.map((d) => d.temperature));
    const humidityMax = Math.max(...data.map((d) => d.humidity));
    const pressureMin = Math.min(...data.map((d) => d.pressure));
    const pressureMax = Math.max(...data.map((d) => d.pressure));

    // Gerar pontos das linhas
    const temperatureLine = data
      .map((d, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y =
          padding +
          chartHeight -
          ((d.temperature - tempMin) / (tempMax - tempMin)) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    const humidityLine = data
      .map((d, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - (d.humidity / 100) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    const pressureLine = data
      .map((d, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y =
          padding +
          chartHeight -
          ((d.pressure - pressureMin) / (pressureMax - pressureMin)) *
            chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    return `
      <svg width="${width}" height="${height}" style="background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
        <!-- Grid -->
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${
              colors.grid
            }" stroke-width="1" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.5"/>
        
        <!-- Eixos -->
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${
      height - padding
    }" stroke="${colors.text}" stroke-width="2"/>
        <line x1="${padding}" y1="${height - padding}" x2="${
      width - padding
    }" y2="${height - padding}" stroke="${colors.text}" stroke-width="2"/>
        
        <!-- Linhas dos dados -->
        <!-- Temperatura -->
        <polyline points="${temperatureLine}" fill="none" stroke="${
      colors.temperature
    }" stroke-width="3" opacity="0.8"/>
        
        <!-- Umidade -->
        <polyline points="${humidityLine}" fill="none" stroke="${
      colors.humidity
    }" stroke-width="3" opacity="0.8" stroke-dasharray="5,5"/>
        
        <!-- Pressão -->
        <polyline points="${pressureLine}" fill="none" stroke="${
      colors.pressure
    }" stroke-width="2" opacity="0.8" stroke-dasharray="10,5"/>
        
        <!-- Pontos de dados -->
        ${data
          .map((d, i) => {
            const x = padding + (i / (data.length - 1)) * chartWidth;
            const tempY =
              padding +
              chartHeight -
              ((d.temperature - tempMin) / (tempMax - tempMin)) * chartHeight;
            const humY =
              padding + chartHeight - (d.humidity / 100) * chartHeight;

            return `
            <circle cx="${x}" cy="${tempY}" r="4" fill="${colors.temperature}" opacity="0.8"/>
            <circle cx="${x}" cy="${humY}" r="3" fill="${colors.humidity}" opacity="0.8"/>
          `;
          })
          .join("")}
        
        <!-- Labels do eixo X -->
        ${data
          .filter((_, i) => i % Math.ceil(data.length / 6) === 0)
          .map((d, i) => {
            const x =
              padding +
              ((i * Math.ceil(data.length / 6)) / (data.length - 1)) *
                chartWidth;
            return `<text x="${x}" y="${
              height - padding + 20
            }" text-anchor="middle" font-size="10" fill="${colors.text}">${
              d.time
            }</text>`;
          })
          .join("")}
        
        <!-- Legenda -->
        <text x="${padding}" y="25" font-size="12" fill="${
      colors.temperature
    }" font-weight="bold">━ Temperatura (${tempMin}°C - ${tempMax}°C)</text>
        <text x="${padding}" y="40" font-size="12" fill="${
      colors.humidity
    }" font-weight="bold">┅ Umidade (0-100%)</text>
        <text x="${padding}" y="55" font-size="12" fill="${
      colors.pressure
    }" font-weight="bold">┄ Pressão (${pressureMin}-${pressureMax}hPa)</text>
      </svg>
    `;
  }

  // 2. GRÁFICO DE RADAR/COMPASS: Direção e Velocidade do Vento
  static generateWindCompass(
    data: WeatherChartData[],
    size: number = 200
  ): string {
    if (data.length === 0) return "";

    const center = size / 2;
    const radius = size / 2 - 30;

    // Últimas 8 leituras de vento
    const windData = data.slice(-8);
    const maxWindSpeed = Math.max(...data.map((d) => d.windSpeed));

    return `
      <svg width="${size}" height="${size}" style="background: radial-gradient(circle, #f0f9ff 0%, #e0f2fe 100%); border-radius: 50%; border: 3px solid #0284c7;">
        <!-- Círculos concêntricos -->
        <circle cx="${center}" cy="${center}" r="${
      radius * 0.25
    }" fill="none" stroke="#94a3b8" stroke-width="1" opacity="0.5"/>
        <circle cx="${center}" cy="${center}" r="${
      radius * 0.5
    }" fill="none" stroke="#94a3b8" stroke-width="1" opacity="0.5"/>
        <circle cx="${center}" cy="${center}" r="${
      radius * 0.75
    }" fill="none" stroke="#94a3b8" stroke-width="1" opacity="0.5"/>
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#475569" stroke-width="2"/>
        
        <!-- Pontos cardeais -->
        <text x="${center}" y="20" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">N</text>
        <text x="${size - 15}" y="${
      center + 5
    }" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">E</text>
        <text x="${center}" y="${
      size - 10
    }" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">S</text>
        <text x="15" y="${
          center + 5
        }" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">W</text>
        
        <!-- Linhas cardeais -->
        <line x1="${center}" y1="30" x2="${center}" y2="${
      size - 30
    }" stroke="#64748b" stroke-width="1" opacity="0.5"/>
        <line x1="30" y1="${center}" x2="${
      size - 30
    }" y2="${center}" stroke="#64748b" stroke-width="1" opacity="0.5"/>
        
        <!-- Vetores de vento -->
        ${windData
          .map((d, i) => {
            const angle = (d.windDirection - 90) * (Math.PI / 180); // Ajustar para Norte = 0°
            const intensity =
              (d.windSpeed / (maxWindSpeed || 1)) * radius * 0.8;
            const endX = center + Math.cos(angle) * intensity;
            const endY = center + Math.sin(angle) * intensity;
            const opacity = 0.3 + (i / windData.length) * 0.7; // Mais recentes são mais visíveis

            return `
            <line x1="${center}" y1="${center}" x2="${endX}" y2="${endY}" 
                  stroke="#dc2626" stroke-width="3" opacity="${opacity}" 
                  marker-end="url(#arrowhead)"/>
            <circle cx="${endX}" cy="${endY}" r="3" fill="#dc2626" opacity="${opacity}"/>
          `;
          })
          .join("")}
        
        <!-- Definir seta -->
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626"/>
          </marker>
        </defs>
        
        <!-- Centro -->
        <circle cx="${center}" cy="${center}" r="5" fill="#1e293b"/>
        
        <!-- Velocidade atual -->
        <text x="${center}" y="${
      center + 25
    }" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">
          ${windData[windData.length - 1]?.windSpeed.toFixed(1) || 0} km/h
        </text>
      </svg>
    `;
  }

  // 3. GRÁFICO DE BARRAS 3D: Comparação por Hora
  static generate3DBarChart(
    data: WeatherChartData[],
    width: number = 600,
    height: number = 300
  ): string {
    if (data.length === 0) return "";

    const barWidth = (width - 100) / data.length;
    const maxTemp = Math.max(...data.map((d) => d.temperature));
    const maxHumidity = Math.max(...data.map((d) => d.humidity));

    return `
      <svg width="${width}" height="${height}" style="background: linear-gradient(to bottom, #f1f5f9 0%, #e2e8f0 100%); border-radius: 12px;">
        <!-- Fundo 3D -->
        <defs>
          <linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef3c7"/>
            <stop offset="50%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
          <linearGradient id="humGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#dbeafe"/>
            <stop offset="50%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#1d4ed8"/>
          </linearGradient>
        </defs>
        
        <!-- Título -->
        <text x="${
          width / 2
        }" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#1e293b">
          🌡️ Temperatura vs 💧 Umidade por Horário
        </text>
        
        <!-- Barras 3D -->
        ${data
          .map((d, i) => {
            const x = 50 + i * barWidth;
            const tempHeight = (d.temperature / maxTemp) * (height - 120);
            const humHeight = (d.humidity / maxHumidity) * (height - 120);
            const tempY = height - 50 - tempHeight;
            const humY = height - 50 - humHeight;

            return `
            <!-- Barra de Temperatura -->
            <g>
              <!-- Sombra 3D -->
              <rect x="${x + 3}" y="${tempY + 3}" width="${
              barWidth * 0.35
            }" height="${tempHeight}" 
                    fill="#000" opacity="0.2" rx="2"/>
              <!-- Barra principal -->
              <rect x="${x}" y="${tempY}" width="${
              barWidth * 0.35
            }" height="${tempHeight}" 
                    fill="url(#tempGrad)" stroke="#d97706" stroke-width="1" rx="2"/>
              <!-- Topo 3D -->
              <ellipse cx="${x + (barWidth * 0.35) / 2}" cy="${tempY}" rx="${
              (barWidth * 0.35) / 2
            }" ry="3" 
                       fill="#fbbf24"/>
            </g>
            
            <!-- Barra de Umidade -->
            <g>
              <!-- Sombra 3D -->
              <rect x="${x + barWidth * 0.4 + 3}" y="${humY + 3}" width="${
              barWidth * 0.35
            }" height="${humHeight}" 
                    fill="#000" opacity="0.2" rx="2"/>
              <!-- Barra principal -->
              <rect x="${x + barWidth * 0.4}" y="${humY}" width="${
              barWidth * 0.35
            }" height="${humHeight}" 
                    fill="url(#humGrad)" stroke="#1d4ed8" stroke-width="1" rx="2"/>
              <!-- Topo 3D -->
              <ellipse cx="${
                x + barWidth * 0.4 + (barWidth * 0.35) / 2
              }" cy="${humY}" rx="${(barWidth * 0.35) / 2}" ry="3" 
                       fill="#60a5fa"/>
            </g>
            
            <!-- Labels -->
            <text x="${x + barWidth / 2}" y="${
              height - 30
            }" text-anchor="middle" font-size="9" fill="#475569">
              ${d.time}
            </text>
            <text x="${x + (barWidth * 0.35) / 2}" y="${
              tempY - 5
            }" text-anchor="middle" font-size="8" fill="#d97706" font-weight="bold">
              ${d.temperature}°
            </text>
            <text x="${x + barWidth * 0.4 + (barWidth * 0.35) / 2}" y="${
              humY - 5
            }" text-anchor="middle" font-size="8" fill="#1d4ed8" font-weight="bold">
              ${d.humidity}%
            </text>
          `;
          })
          .join("")}
        
        <!-- Legenda -->
        <rect x="20" y="50" width="15" height="15" fill="url(#tempGrad)" rx="2"/>
        <text x="40" y="62" font-size="12" fill="#d97706" font-weight="bold">Temperatura (°C)</text>
        
        <rect x="20" y="70" width="15" height="15" fill="url(#humGrad)" rx="2"/>
        <text x="40" y="82" font-size="12" fill="#1d4ed8" font-weight="bold">Umidade (%)</text>
      </svg>
    `;
  }

  // 4. GRÁFICO DE ÁREA EMPILHADA: Pressão Atmosférica com Tendência
  static generatePressureTrendChart(
    data: WeatherChartData[],
    width: number = 500,
    height: number = 200
  ): string {
    if (data.length === 0) return "";

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const pressureMin = Math.min(...data.map((d) => d.pressure)) - 5;
    const pressureMax = Math.max(...data.map((d) => d.pressure)) + 5;

    // Calcular linha de tendência
    const trend = this.calculateTrend(data.map((d) => d.pressure));

    // Gerar pontos da área
    const areaPoints = data
      .map((d, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y =
          padding +
          chartHeight -
          ((d.pressure - pressureMin) / (pressureMax - pressureMin)) *
            chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    // Adicionar pontos da base para fechar a área
    const baseY = height - padding;
    const areaPath = `${padding},${baseY} ${areaPoints} ${
      width - padding
    },${baseY}`;

    return `
      <svg width="${width}" height="${height}" style="background: linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%); border-radius: 8px; border: 1px solid #cbd5e1;">
        
        <!-- Definir gradiente da área -->
        <defs>
          <linearGradient id="pressureGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.1"/>
          </linearGradient>
        </defs>
        
        <!-- Título -->
        <text x="${
          width / 2
        }" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">
          📊 Pressão Atmosférica - Tendência ${
            trend > 0 ? "📈" : trend < 0 ? "📉" : "➡️"
          }
        </text>
        
        <!-- Grid horizontal -->
        ${[0.25, 0.5, 0.75]
          .map((ratio) => {
            const y = padding + chartHeight * ratio;
            const pressure = pressureMax - (pressureMax - pressureMin) * ratio;
            return `
            <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" 
                  stroke="#cbd5e1" stroke-width="1" opacity="0.5" stroke-dasharray="2,2"/>
            <text x="${padding - 5}" y="${
              y + 3
            }" text-anchor="end" font-size="10" fill="#64748b">
              ${pressure.toFixed(0)}
            </text>
          `;
          })
          .join("")}
        
        <!-- Área preenchida -->
        <polygon points="${areaPath}" fill="url(#pressureGrad)" stroke="none"/>
        
        <!-- Linha principal -->
        <polyline points="${areaPoints}" fill="none" stroke="#8b5cf6" stroke-width="3"/>
        
        <!-- Pontos de dados -->
        ${data
          .map((d, i) => {
            const x = padding + (i / (data.length - 1)) * chartWidth;
            const y =
              padding +
              chartHeight -
              ((d.pressure - pressureMin) / (pressureMax - pressureMin)) *
                chartHeight;

            return `
            <circle cx="${x}" cy="${y}" r="4" fill="white" stroke="#8b5cf6" stroke-width="2"/>
            <text x="${x}" y="${
              y - 10
            }" text-anchor="middle" font-size="8" fill="#6d28d9" font-weight="bold">
              ${d.pressure.toFixed(0)}
            </text>
          `;
          })
          .join("")}
        
        <!-- Labels do tempo -->
        ${data
          .filter((_, i) => i % Math.ceil(data.length / 4) === 0)
          .map((d, i) => {
            const x =
              padding +
              ((i * Math.ceil(data.length / 4)) / (data.length - 1)) *
                chartWidth;
            return `<text x="${x}" y="${
              height - 10
            }" text-anchor="middle" font-size="9" fill="#475569">${
              d.time
            }</text>`;
          })
          .join("")}
        
        <!-- Indicador de tendência -->
        <text x="${width - 20}" y="45" text-anchor="end" font-size="12" fill="${
      trend > 0 ? "#16a34a" : trend < 0 ? "#dc2626" : "#64748b"
    }" font-weight="bold">
          ${trend > 0 ? "↗ Subindo" : trend < 0 ? "↘ Descendo" : "→ Estável"}
        </text>
      </svg>
    `;
  }

  // Método auxiliar para calcular tendência
  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const first =
      values.slice(0, Math.floor(values.length / 3)).reduce((a, b) => a + b) /
      Math.floor(values.length / 3);
    const last =
      values.slice(-Math.floor(values.length / 3)).reduce((a, b) => a + b) /
      Math.floor(values.length / 3);
    return last - first;
  }

  // 5. DASHBOARD COMPLETO: Combina todos os gráficos
  static generateWeatherDashboard(data: WeatherChartData[]): string {
    const config: ChartConfig = {
      width: 500,
      height: 250,
      colors: {
        temperature: "#f59e0b",
        humidity: "#3b82f6",
        pressure: "#8b5cf6",
        wind: "#dc2626",
        grid: "#e2e8f0",
        text: "#1e293b",
      },
    };

    const multiLine = this.generateMultiLineChart(data, config);
    const windCompass = this.generateWindCompass(data, 180);
    const barChart = this.generate3DBarChart(data, 500, 250);
    const pressureChart = this.generatePressureTrendChart(data, 500, 180);

    return `
      <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px; border-radius: 12px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e293b; margin: 0; font-size: 24px;">🌤️ Dashboard Meteorológico Completo</h1>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">
            Análise completa dos dados de ${data.length} leituras
          </p>
        </div>

        <!-- Grid de gráficos -->
        <div style="display: grid; grid-template-columns: 1fr 200px; gap: 20px; margin-bottom: 20px;">
          
          <!-- Gráfico Multi-linha -->
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; color: #374151;">📈 Tendências Temporais</h3>
            ${multiLine}
          </div>

          <!-- Compass do Vento -->
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">🧭 Ventos</h3>
            ${windCompass}
          </div>
        </div>

        <!-- Gráfico de Barras 3D -->
        <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">📊 Comparação por Horário</h3>
          ${barChart}
        </div>

        <!-- Gráfico de Pressão -->
        <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 15px 0; color: #374151;">⚡ Pressão Atmosférica</h3>
          ${pressureChart}
        </div>

        <!-- Estatísticas Resumo -->
        <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          
          <div style="background: linear-gradient(135deg, #fef3c7, #f59e0b); padding: 15px; border-radius: 8px; color: white;">
            <h4 style="margin: 0; font-size: 14px;">🌡️ TEMPERATURA</h4>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">
              ${Math.min(...data.map((d) => d.temperature))}° - ${Math.max(
      ...data.map((d) => d.temperature)
    )}°C
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #dbeafe, #3b82f6); padding: 15px; border-radius: 8px; color: white;">
            <h4 style="margin: 0; font-size: 14px;">💧 UMIDADE</h4>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">
              ${Math.round(
                data.reduce((sum, d) => sum + d.humidity, 0) / data.length
              )}% média
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #ede9fe, #8b5cf6); padding: 15px; border-radius: 8px; color: white;">
            <h4 style="margin: 0; font-size: 14px;">📊 PRESSÃO</h4>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">
              ${Math.round(
                data.reduce((sum, d) => sum + d.pressure, 0) / data.length
              )} hPa
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #fecaca, #dc2626); padding: 15px; border-radius: 8px; color: white;">
            <h4 style="margin: 0; font-size: 14px;">💨 VENTO</h4>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">
              ${Math.max(...data.map((d) => d.windSpeed)).toFixed(1)} km/h máx
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Dashboard gerado em ${new Date().toLocaleString("pt-BR")} • ${
      data.length
    } leituras processadas
          </p>
        </div>
      </div>
    `;
  }
}
