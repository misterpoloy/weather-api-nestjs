import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class WeatherService {
  constructor(private readonly redisService: RedisService) {}

  async getWeatherData(location: string): Promise<any> {
    const cacheKey = `weather:${location}`;
    const cachedData = await this.redisService.get(cacheKey);

    if (cachedData) {
      console.log('✅ Data retrieved from cache');
      return JSON.parse(cachedData);
    }

    try {
      // Step 1: Get the grid point information to obtain the forecast URL
      const pointUrl = `${process.env.WEATHER_API_BASE_URL}/points/${location}`;
      const pointResponse = await axios.get(pointUrl);

      const forecastUrl = pointResponse.data.properties.forecast;
      console.log('🌐 Fetching forecast from URL:', forecastUrl);

      // Step 2: Fetch the actual weather forecast using the obtained URL
      const forecastResponse = await axios.get(forecastUrl);
      const weatherData = forecastResponse.data;

      // Step 3: Filter out relevant properties
      const relevantData = {
        updated: weatherData.properties.updated,
        periods: weatherData.properties.periods.map((period: any) => ({
          name: period.name,
          temperature: period.temperature,
          temperatureUnit: period.temperatureUnit,
          windSpeed: period.windSpeed,
          windDirection: period.windDirection,
          shortForecast: period.shortForecast,
        })),
      };

      // Step 4: Cache the filtered data
      const cacheTTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 3600;
      await this.redisService.set(cacheKey, JSON.stringify(relevantData), cacheTTL);

      return relevantData;
    } catch (error) {
      console.error('Error fetching weather data:', error.response?.data || error.message);
      throw error;
    }
  }
}
