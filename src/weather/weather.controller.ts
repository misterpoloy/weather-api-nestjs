import { Controller, Get, Param } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get(':location')
  async getWeather(@Param('location') location: string) {
    return await this.weatherService.getWeatherData(location);
  }
}
