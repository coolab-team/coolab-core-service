import { Encryption } from '@self/abstractions';
import { env } from '@self/consts';
import { z } from 'zod';

type AccessTokenContent = {
  email: string;
  id: string;
};

type AuthenticationTokenContent = {
  email: string;
  id: string;
};

type UploadPathContent = {
  path: string;
  userId: string;
};

class PlatformEncryption extends Encryption {
  private accessTokenSchema = this.validator().object({
    email: this.validator().email(),
    id: this.validator().id(),
  }) satisfies z.ZodType<AccessTokenContent>;

  private authenticationTokenSchema = this.validator().object({
    email: this.validator().email(),
    id: this.validator().id(),
  }) satisfies z.ZodType<AuthenticationTokenContent>;

  private uploadPathSchema = this.validator().object({
    path: this.validator().string().refine(value => value.endsWith('.png'), {
      message: 'Upload path must be a PNG path.',
    }),
    userId: this.validator().id(),
  }) satisfies z.ZodType<UploadPathContent>;

  constructor() {
    super(env.AUTH_ENCRYPTION_PRIVATE_KEY);
  }

  public encryptAccessToken(content: AccessTokenContent) {
    const encrypted = this.encrypt(content);
    return encrypted;
  }

  public encryptAuthenticationToken(content: AuthenticationTokenContent) {
    const encrypted = this.encrypt(content);
    return encrypted;
  }

  public encryptUploadPath(content: UploadPathContent) {
    const encrypted = this.encrypt(content);
    return encrypted;
  }

  public decryptAccessToken(content: string) {
    const decrypted = this.decrypt(content);
    const parsed = this.createSchema(this.accessTokenSchema).parse(decrypted);
    return parsed;
  }

  public decryptAuthenticationToken(content: string) {
    const decrypted = this.decrypt(content);
    const parsed = this.createSchema(this.authenticationTokenSchema).parse(decrypted);
    return parsed;
  }

  public decryptUploadPath(content: string) {
    const decrypted = this.decrypt(content);
    const parsed = this.createSchema(this.uploadPathSchema).parse(decrypted);
    return parsed;
  }
}

const encryption = new PlatformEncryption();

export { encryption as PlatformEncryption };
