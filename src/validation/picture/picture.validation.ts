import { z } from 'zod';

const prefix = 'data:image/png;base64,';

export const picture = () => z.string()
  .refine(value => {
    const isPng = value.startsWith(prefix);
    return isPng;
  }, {
    message: 'Picture must be a PNG image.',
  })
  .refine(value => {
    const { error } = z.base64().safeParse(value.replace(prefix, ''));
    return !error;
  }, {
    message: 'Picture must be a valid base64 string.',
  })
  .refine(value => {
    const buffer = Buffer.from(value.replace(prefix, ''), 'base64');
    return buffer.length <= 1024 * 1024;
  }, {
    message: 'Picture must be a 1MB PNG image max.',
  })
  .openapi({
    description: 'A base64 encoded PNG image.',
    type: 'string',
  });
