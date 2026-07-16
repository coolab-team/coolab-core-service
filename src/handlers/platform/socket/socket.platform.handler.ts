import { upgradeWebSocket } from '@hono/node-server';
import { app } from '@self/app';
import { PlatformContext } from '@self/contexts';
import { ActiveSocketConnectionsMemory } from '@self/memories';
import {
  LoggingUtil,
  RoutingUtil,
  SocketUtil,
} from '@self/utils';
import { validation } from '@self/validation';

const path = RoutingUtil.path('/platform/v1/socket');

const pongPayloadSchema = validation().object({
  payload: validation().unknown(),
  type: validation().literal('pong'),
});

const handler = app.get(
  path,
  SocketUtil.validationMiddleware,
  PlatformContext.middleware(),
  upgradeWebSocket(() => {
    const user = PlatformContext.getUser();
    let hasClosed = false;
    let lastPongAt = Date.now();
    let memoryOperation: Promise<void> = Promise.resolve();
    let hasPendingRefresh = false;
    let pingPongInterval: NodeJS.Timeout | null = null;

    const queueMemoryOperation = (operation: () => Promise<void>) => {
      memoryOperation = memoryOperation
        .then(operation)
        .catch(() => {
          LoggingUtil.error('Failed to track platform socket connection.');
        });
    };

    const registerConnection = () => {
      queueMemoryOperation(async () => {
        if(hasClosed) return;

        const { count } = await ActiveSocketConnectionsMemory.register({
          userId: user.id,
        });

        if(!hasClosed) {
          LoggingUtil.info(`${user.email} connected to platform. Total: ${count}`);
        }
      });
    };

    const refreshConnection = () => {
      if(hasClosed || hasPendingRefresh) return;

      hasPendingRefresh = true;

      queueMemoryOperation(async () => {
        try {
          if(hasClosed) return;

          await ActiveSocketConnectionsMemory.register({
            userId: user.id,
          });
        } finally {
          hasPendingRefresh = false;
        }
      });
    };

    const onEnd = () => {
      if(hasClosed) return;

      hasClosed = true;

      if(pingPongInterval) {
        clearInterval(pingPongInterval);
        pingPongInterval = null;
      }

      queueMemoryOperation(async () => {
        const { count } = await ActiveSocketConnectionsMemory.subtract({
          userId: user.id,
        });
        LoggingUtil.info(`${user.email} disconnected from platform. Total: ${count}`);
      });
    };

    return {
      onClose: () => {
        onEnd();
      },
      onError: (_, ws) => {
        try {
          ws.send(JSON.stringify({
            message: 'Connection error.',
          }));
          ws.close();
        } finally {
          onEnd();
        }
      },
      onMessage: SocketUtil.onMessage(pongPayloadSchema, () => {
        lastPongAt = Date.now();
        refreshConnection();
      }),
      onOpen: (_, ws) => {
        registerConnection();

        pingPongInterval = setInterval(() => {
          if(Date.now() - lastPongAt > 30_000) {
            if(pingPongInterval) {
              clearInterval(pingPongInterval);
              pingPongInterval = null;
            }

            ws.close();
            return;
          }

          ws.send(JSON.stringify({
            name: 'ping',
            payload: {
              timestamp: Date.now(),
            },
          }));
        }, 10_000);
      },
    };
  }),
);

export { handler as socketPlatformHandler };
