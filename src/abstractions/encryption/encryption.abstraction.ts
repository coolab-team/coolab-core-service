import crypto from 'node:crypto';

import { validation } from '@self/validation';
import { z } from 'zod';

export type BaseContent = {
  createdAt: Date;
  seed: string;
};

export abstract class Encryption {
  private privateKey: Uint8Array;

  protected baseContentSchema = validation().object({
    createdAt: validation().coerce.date(),
    seed: validation().string(),
  }) satisfies z.ZodType<BaseContent>;

  protected validator = validation;

  constructor(privateKey: string) {
    this.privateKey = this.buildKey(privateKey);
  }

  protected createSchema<T extends object>(schema: z.ZodType<T>) {
    const contentSchema = this.baseContentSchema.extend({
      content: schema,
    });
    return contentSchema;
  }

  protected decrypt(content: string) {
    const iv = Uint8Array.from(Buffer.from(content.slice(0, 32), 'hex'));
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.privateKey, iv);
    let decrypted = decipher.update(content.slice(32), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const parsed = JSON.parse(decrypted);

    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      seed: parsed.seed,
    };
  }

  protected encrypt(content: object) {
    const iv = Uint8Array.from(crypto.randomBytes(16));
    const cipher = crypto.createCipheriv('aes-256-cbc', this.privateKey, iv);
    let encrypted = cipher.update(JSON.stringify({
      content,
      createdAt: new Date(),
      seed: crypto.randomBytes(16).toString('hex'),
    }), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const serialized = Buffer.from(iv).toString('hex') + encrypted;
    return serialized;
  }

  private buildKey(privateKey: string) {
    const key = crypto.pbkdf2Sync(privateKey, '', 100000, 32, 'sha256');
    const mapped = Uint8Array.from(key);
    return mapped;
  }
}
