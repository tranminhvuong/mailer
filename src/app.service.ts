import _ from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { SES } from 'aws-sdk';
import { ConfigService } from './config/config.service';
import { join } from 'path';
import { readFileSync } from 'fs';

enum EmailTemplates {
  FORGOT_PASSWORD = 'forgot-password',
  POST_UPDATED = 'post-updated',
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private ses: SES;
  constructor(private configService: ConfigService) {
    this.ses = new SES({
      ...this.configService.get('aws'),
    });
  }
  public async sendEmail(data): Promise<void> {
    this.logger.log(data);
    const { template, payload } = data;
    const templatePath = join(
      __dirname,
      './templates/',
      `${EmailTemplates[template]}.html`,
    );
    let _content = readFileSync(templatePath, 'utf-8');
    const compiled = _.template(_content);
    _content = compiled(payload.data);
    this.ses
      .sendEmail({
        Source: this.configService.get('sourceEmail'),
        Destination: {
          ToAddresses: payload.emails,
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: _content,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: payload.subject,
          },
        },
      })
      .promise()
      .catch((error) => this.logger.error(error));
  }
}
