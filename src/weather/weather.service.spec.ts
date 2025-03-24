import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { RedisService } from '../redis/redis.service';
import axios from 'axios';

// Mock Axios to avoid real API calls
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  let service: WeatherService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),  // Return null to simulate cache miss
            set: jest.fn().mockResolvedValue(undefined),  // Simulate successful cache set
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return weather data', async () => {
    const mockWeatherData = { properties: { temperature: 25 } };

    // Mock the Axios response
    mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

    const result = await service.getWeatherData('39.7456,-97.0892');
    expect(result).toEqual(mockWeatherData);

    // Verify that Redis `set` was called with the correct arguments
    expect(redisService.set).toHaveBeenCalledWith(
      'weather:39.7456,-97.0892',
      JSON.stringify(mockWeatherData),
      3600  // TTL from the environment or default value
    );
  });

  it('should get weather data from cache', async () => {
    const cachedData = { properties: { temperature: 28 } };
    jest.spyOn(redisService, 'get').mockResolvedValueOnce(JSON.stringify(cachedData));

    const result = await service.getWeatherData('39.7456,-97.0892');
    expect(result).toEqual(cachedData);

    // Verify that Redis `get` was called with the correct key
    expect(redisService.get).toHaveBeenCalledWith('weather:39.7456,-97.0892');
  });
});
