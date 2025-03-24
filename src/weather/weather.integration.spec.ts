import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import axios from 'axios';
import { RedisService } from '../redis/redis.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Weather API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(RedisService)  // Override the RedisService
    .useValue({
      get: jest.fn().mockResolvedValue(null),  // Mock get to always return null
      set: jest.fn().mockResolvedValue(undefined),  // Mock set to do nothing
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/weather/39.7456,-97.0892 (GET)', async () => {
    // Mock the API response from the Weather API
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        properties: {
          forecast: 'https://api.weather.gov/gridpoints/TOP/31,80/forecast',
        },
      },
    });

    mockedAxios.get.mockResolvedValueOnce({
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
    });

    const response = await request(app.getHttpServer())
      .get('/weather/39.7456,-97.0892')
      .expect(200);

    expect(response.body).toEqual({
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
