import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
config();

interface Config {
  rb_url: string;
  auth_queue: string;
  mailer_queue: string;
  redis_host: string;
  redis_port: string;
  redis_password: string;
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  sourceEmail: string;
}

@Injectable()
export class ConfigService {
  private config = {} as Config;
  constructor() {
    this.config.rb_url = process.env.RABBITMQ_URL;
    this.config.auth_queue = process.env.RABBITMQ_AUTH_QUEUE;
    this.config.mailer_queue = process.env.RABBITMQ_MAILER_QUEUE;
    this.config.redis_host = process.env.REDIS_HOST;
    this.config.redis_port = process.env.REDIS_PORT;
    this.config.redis_password = process.env.REDIS_PASSWORD;
    this.config.aws = {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    };
    this.config.sourceEmail = process.env.SOURCE_EMAIL;
  }

  public get(key: keyof Config): any {
    return this.config[key];
  }
}
