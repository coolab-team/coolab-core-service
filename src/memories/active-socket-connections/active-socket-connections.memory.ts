import { Memory } from '@self/abstractions';

class ActiveSocketConnectionsMemory extends Memory {
  private readonly oneMinuteInSeconds = 60;

  public async register(params: { userId: string; }) {
    await this.set(
      this.setupKey(params.userId),
      Date.now().toString(),
      this.oneMinuteInSeconds,
    );

    const count = await this.count();
    return { count };
  }

  public async subtract(params: { userId: string; }) {
    await this.delete(this.setupKey(params.userId));

    const count = await this.count();
    return { count };
  }

  private async count() {
    const connections = await this.getKeys('memo:active-socket-connections:platform:*');
    return connections.length;
  }

  private setupKey(userId: string) {
    return `memo:active-socket-connections:platform:${userId}` as const;
  }
}

const memory = new ActiveSocketConnectionsMemory();

export { memory as ActiveSocketConnectionsMemory };
