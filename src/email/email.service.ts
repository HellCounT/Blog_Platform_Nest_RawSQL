import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { ConfigurationType } from '../configuration/configuration';
import { ConfigService } from '@nestjs/config';

export type Email = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService<ConfigurationType>,
  ) {}
  async sendMail(form: Email): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_LOGIN'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });

    await transporter.sendMail({
      from: form.from,
      to: form.to,
      subject: form.subject,
      html: form.html,
    });
  }
}
