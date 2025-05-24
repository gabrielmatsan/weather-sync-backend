interface WeatherChartData {
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  timestamp: number;
}

export class WeatherChartGenerator {
  static transformData(weatherData: any[]): WeatherChartData[] {
    console.log(
      `🔄 Transformando ${weatherData.length} registros meteorológicos...`
    );

    return weatherData
      .filter((w) => w.createdAt !== null)
      .map((weather) => {
        const transformedData = {
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
        };

        console.log(
          `   📊 ${transformedData.time}: ${transformedData.temperature}°C, ${transformedData.humidity}%`
        );
        return transformedData;
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }
}
