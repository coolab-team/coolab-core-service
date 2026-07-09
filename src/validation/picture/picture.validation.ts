import { z } from 'zod';

export const picture = () => z.string()
  .refine(value => value.endsWith('.png'), {
    message: 'Picture must be a PNG path.',
  })
  .openapi({
    description: 'A PNG picture path.',
    type: 'string',
  });
