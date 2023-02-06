import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger();
  const configService = new ConfigService();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`${configService.get('rb_url')}`],
        queue: `${configService.get('mailer_queue')}`,
        queueOptions: { durable: false },
        prefetchCount: 1,
      },
    },
  );
  await app.listen();
  logger.log('🚀 Mailer service started successfully');
}
bootstrap();
