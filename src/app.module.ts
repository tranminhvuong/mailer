import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from './config/config.service';
import { TaskProcessor } from './task.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis_host'),
          port: configService.get('redis_port'),
          password: configService.get('redis_password'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'email-sender',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TaskProcessor],
})
export class AppModule {}
