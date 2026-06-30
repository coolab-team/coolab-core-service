import { z } from 'zod';

export const pageSize = () => z.coerce.number().min(1).max(100).default(10)
  .describe('The page size.');
