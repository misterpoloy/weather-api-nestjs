import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeatherModule } from './weather/weather.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [WeatherModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
