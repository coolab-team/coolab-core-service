import { z } from 'zod';

export const picture = () => z.string()
  .refine(value => value.endsWith('.png'), {
    message: 'Picture must be a PNG path.',
  });
