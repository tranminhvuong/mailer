import { Process, Processor } from '@nestjs/bull';
import { ConfigService } from './config/config.service';
import { join } from 'path';
import { readFileSync } from 'fs';
import { SES } from 'aws-sdk';
import { Logger } from '@nestjs/common';
import * as _ from 'lodash';

enum EmailTemplates {
  FORGOT_PASSWORD = 'forgot-password',
  POST_UPDATED = 'post-updated',
}

@Processor('email-sender')
export class TaskProcessor {
  ses: SES;
  private readonly logger = new Logger(TaskProcessor.name);
  constructor(private configService: ConfigService) {
    this.logger = new Logger();
    this.ses = new SES({
      ...this.configService.get('aws'),
    });
  }

  @Process()
  async senderHanlder(job: {
    data: { template: EmailTemplates; payload: any };
  }) {
    this.logger.log(job.data);
    const { template, payload } = job.data;
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
