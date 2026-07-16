import { env } from '@self/consts';
import { LoggingUtil } from '@self/utils';
import { createClient } from 'redis';
import { z } from 'zod';

type EventPayloads = {
  'new-version-available': {
    timestamp: number;
  };
};

type EventName = keyof EventPayloads;
type Event<TEventName extends EventName> = {
  id: string;
  name: TEventName;
  payload: EventPayloads[TEventName];
};
type EventHandler<TEventName extends EventName> = (event: Event<TEventName>) => void;
type RedisClient = ReturnType<typeof createClient>;

const eventSchema = z.object({
  id: z.uuid(),
  name: z.literal('new-version-available'),
  payload: z.object({
    timestamp: z.number(),
  }),
});

class PlatformSocketEvents {
  private readonly channel = 'coolab:events:platform-socket';
  private readonly handlers = new Set<EventHandler<'new-version-available'>>();
  private readonly publisher: RedisClient;
  private readonly subscriber: RedisClient;
  private publisherConnection: Promise<void> | null = null;
  private subscriberConnection: Promise<void> | null = null;
  private isSubscribed = false;

  constructor() {
    this.publisher = this.createClient();
    this.subscriber = this.createClient();
  }

  public async emit<TEventName extends EventName>(event: Event<TEventName>) {
    await this.ensurePublisherConnection();

    const result = await this.publisher.publish(this.channel, JSON.stringify(event));
    return result;
  }

  public async subscribe<TEventName extends EventName>(
    name: TEventName,
    handler: EventHandler<TEventName>,
  ) {
    await this.ensureSubscriberConnection();

    if(name === 'new-version-available') {
      this.handlers.add(handler as EventHandler<'new-version-available'>);
    }

    const unsubscribe = () => {
      if(name === 'new-version-available') {
        this.handlers.delete(handler as EventHandler<'new-version-available'>);
      }
    };
    return unsubscribe;
  }

  private createClient() {
    const client = createClient({
      database: env.REDIS_DATABASE,
      password: env.REDIS_PASSWORD || undefined,
      socket: {
        host: env.REDIS_URL,
        port: env.REDIS_PORT,
      },
    });

    client.on('error', error => {
      LoggingUtil.error(`Platform socket event Redis error: ${error.message}`);
    });

    return client;
  }

  private async ensurePublisherConnection() {
    if(this.publisher.isOpen) return;

    this.publisherConnection ??= this.publisher.connect()
      .then(() => undefined)
      .finally(() => {
        this.publisherConnection = null;
      });
    await this.publisherConnection;
  }

  private async ensureSubscriberConnection() {
    if(!this.subscriber.isOpen) {
      this.subscriberConnection ??= this.subscriber.connect()
        .then(() => undefined)
        .finally(() => {
          this.subscriberConnection = null;
        });
      await this.subscriberConnection;
    }

    if(this.isSubscribed) return;

    await this.subscriber.subscribe(this.channel, message => {
      this.onMessage(message);
    });
    this.isSubscribed = true;
  }

  private onMessage(message: string) {
    let event: unknown;

    try {
      event = JSON.parse(message);
    } catch {
      LoggingUtil.warn('Invalid platform socket event received.');
      return;
    }

    const parsed = eventSchema.safeParse(event);

    if(!parsed.success) {
      LoggingUtil.warn('Invalid platform socket event received.');
      return;
    }

    this.handlers.forEach(handler => {
      try {
        handler(parsed.data);
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'Unknown error.';
        LoggingUtil.error(`Failed to handle platform socket event: ${message}`);
      }
    });
  }
}

const events = new PlatformSocketEvents();

export { events as PlatformSocketEvents };
