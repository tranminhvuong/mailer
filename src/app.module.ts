import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from './config/config.service';
import { TaskProcessor } from './task.processor';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      ...(process.env.NODE_ENV === 'development' && {
        pinoHttp: {
          transport: {
            target: 'pino-pretty',
            options: {
              singleLine: true,
            },
          },
        },
      }),
    }),
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis_host'),
          port: configService.get('redis_port'),
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
