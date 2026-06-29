import { PlatformEncryption } from '@self/encryptions';
import { MailgunSource } from '@self/sources';

type SendPlatformUserAuthenticationLinkParams = {
  destination: string;
  email: string;
  id: string;
  origin: string;
};

class MailingService {
  private readonly domain = 'sandboxfe7601ddbd4b4daaa2a079593669c62d.mailgun.org';

  private readonly from = 'Mailgun Sandbox <postmaster@sandboxfe7601ddbd4b4daaa2a079593669c62d.mailgun.org>';

  public async sendPlatformUserAuthenticationLink(params: SendPlatformUserAuthenticationLinkParams) {
    const link = this.buildPlatformUserAuthenticationLink({
      email: params.email,
      id: params.id,
      origin: params.origin,
    });

    await MailgunSource.client.messages.create(this.domain, {
      from: this.from,
      html: [
        '<div>',
        '<h3>Access your account</h3>',
        '<p>Hello!</p>',
        '<p>Use the link below to access your account:</p>',
        `<a href="${this.escapeHtml(link)}"><b>Login</b></a>`,
        '<br/>',
        "<p>If you don't recognize this request, please ignore this email.</p>",
        '<p>Regards,<br/>Coolab</p>',
        '</div>',
      ].join(''),
      subject: 'Your login link for Coolab',
      to: params.destination,
    });
  }

  private buildPlatformUserAuthenticationLink(params: {
    email: string;
    id: string;
    origin: string;
  }) {
    const authenticationToken = PlatformEncryption.encryptAuthenticationToken({
      email: params.email,
      id: params.id,
    });
    const url = new URL('/authenticate', params.origin);
    url.searchParams.set('token', authenticationToken);

    return url.toString();
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll('\'', '&#39;');
  }
}

const service = new MailingService();

export { service as MailingService };
