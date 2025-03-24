const mockAxios = {
    get: jest.fn().mockResolvedValue({
      data: {
        properties: {
          forecast: 'https://api.weather.gov/gridpoints/TOP/31,80/forecast',
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
    }),
  };
  
  export default mockAxios;
  