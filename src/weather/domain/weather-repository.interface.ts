import type { Weather } from "./weather.type";

export interface IWeatherRepository {
  getWeatherByPlaceIdAndDate(date: Date, placeId: number): Promise<Weather[]>;
}
