import type { WebSocketLike } from '@hono/node-server';
import type { MiddlewareHandler } from 'hono';
import type { WSContext, WSMessageReceive } from 'hono/ws';
import type { ZodType } from 'zod';

class SocketUtil {
  public static onMessage<T extends ZodType>(
    validator: T,
    callback: (
      data: T['_output'],
      context: {
        evt: MessageEvent<WSMessageReceive>;
        ws: WSContext<WebSocketLike>;
      },
    ) => void,
  ) {
    const handler = (evt: MessageEvent<WSMessageReceive>, ws: WSContext<WebSocketLike>) => {
      let data: unknown;

      try {
        data = JSON.parse(evt.data.toString());
      } catch {
        ws.send(JSON.stringify({
          error: 'Invalid message: Not valid JSON.',
        }));
        return;
      }

      const parsed = validator.safeParse(data);

      if(!parsed.success) {
        ws.send(JSON.stringify({
          error: 'Invalid payload.',
        }));
        return;
      }

      callback(parsed.data, {
        evt,
        ws,
      });
    };

    return handler;
  }

  public static validationMiddleware: MiddlewareHandler = async (c, next) => {
    const isWebSocket = c.req.header('upgrade')?.toLowerCase() === 'websocket';

    if(!isWebSocket) {
      const response = c.json({
        error: 'WebSocket upgrade required.',
        message: 'This endpoint only accepts WebSocket connections.',
      }, 426);
      return response;
    }

    await next();
  };
}

export { SocketUtil };
