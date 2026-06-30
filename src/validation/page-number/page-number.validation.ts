import { z } from 'zod';

export const pageNumber = () => z.coerce.number().min(1).default(1)
  .describe('The page number.');
