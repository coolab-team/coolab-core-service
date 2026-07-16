import '@self/handlers';

import { serve } from '@hono/node-server';
import { app } from '@self/app';
import { env } from '@self/consts';
import { DataUtil, LoggingUtil } from '@self/utils';
import { WebSocketServer } from 'ws';

const handlerTimeoutMs = 30 * 60 * 1000;
const webSocketServer = new WebSocketServer({
  maxPayload: 8 * 1024,
  noServer: true,
});

serve({
  fetch: app.fetch,
  port: Number(env.HTTP_PORT),
  serverOptions: {
    headersTimeout: handlerTimeoutMs,
    requestTimeout: handlerTimeoutMs,
  },
  websocket: {
    server: webSocketServer,
  },
}, info => {
  LoggingUtil.info(`Server is running on http://localhost:${info.port}`);
});

process.on('uncaughtException', error => {
  LoggingUtil.error(`Uncaught exception: ${DataUtil.stringifyError(error)}`);
  process.exit(1);
});

process.on('unhandledRejection', error => {
  LoggingUtil.error(`Unhandled rejection: ${DataUtil.stringifyError(error)}`);
});
