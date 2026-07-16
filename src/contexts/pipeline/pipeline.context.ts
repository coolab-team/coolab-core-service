import { HttpClientContext } from '@self/abstractions';
import { env } from '@self/consts';
import { UnauthorizedException } from '@self/exceptions';
import { MiddlewareHandler } from 'hono';

import { LoggingContext } from '../logging';

class PipelineContext extends HttpClientContext<object> {
  public middleware(): MiddlewareHandler {
    return async (c, next) => {
      const authorization = c.req.header('authorization');

      if(authorization !== env.PIPELINE_API_KEY) {
        throw new UnauthorizedException({
          feedback: {
            enUs: 'Authentication is required.',
            esEs: 'La autenticación es obligatoria.',
            ptBr: 'Autenticação é necessária.',
          },
          message: 'Unauthorized.',
        });
      }

      const baseProperties = await this.setupBaseProperties(c);
      const result = await this.init({
        properties: baseProperties,
        traceId: LoggingContext.get().traceId,
      }, next);
      return result;
    };
  }
}

const context = new PipelineContext();

export { context as PipelineContext };
