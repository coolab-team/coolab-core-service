import { env } from '@self/consts';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

class MailgunSource {
  public client: ReturnType<InstanceType<typeof Mailgun>['client']>;

  constructor() {
    const mailgun = new Mailgun(FormData);
    this.client = mailgun.client({
      key: env.MAILGUN_API_TOKEN,
      username: 'api',
    });
  }
}

const source = new MailgunSource();

export { source as MailgunSource };
