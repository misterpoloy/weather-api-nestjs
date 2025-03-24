import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { RedisService } from '../redis/redis.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),  // Mocking cache miss
            set: jest.fn().mockResolvedValue(undefined),  // Mocking cache set
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return weather data', async () => {
    const mockPointResponse = {
      data: {
        properties: {
          forecast: 'https://api.weather.gov/gridpoints/TOP/31,80/forecast',
        },
      },
    };

    const mockForecastResponse = {
      data: {
        properties: {
          updated: '2025-03-25T10:30:00+00:00',
          periods: [
            {
              name: 'Tonight',
              temperature: 60,
              temperatureUnit: 'F',
              windSpeed: '10 mph',
              windDirection: 'NW',
              shortForecast: 'Clear',
            },
            {
              name: 'Tomorrow',
              temperature: 72,
              temperatureUnit: 'F',
              windSpeed: '15 mph',
              windDirection: 'N',
              shortForecast: 'Partly Cloudy',
            },
          ],
        },
      },
    };

    // Mock the point and forecast API calls
    mockedAxios.get
      .mockResolvedValueOnce(mockPointResponse)  // First call: point API
      .mockResolvedValueOnce(mockForecastResponse);  // Second call: forecast API

    const result = await service.getWeatherData('39.7456,-97.0892');
    expect(result).toEqual({
      updated: '2025-03-25T10:30:00+00:00',
      periods: [
        {
          name: 'Tonight',
          temperature: 60,
          temperatureUnit: 'F',
          windSpeed: '10 mph',
          windDirection: 'NW',
          shortForecast: 'Clear',
        },
        {
          name: 'Tomorrow',
          temperature: 72,
          temperatureUnit: 'F',
          windSpeed: '15 mph',
          windDirection: 'N',
          shortForecast: 'Partly Cloudy',
        },
      ],
    });
  });
});
